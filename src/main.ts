import { startGroup, endGroup, setOutput, info, error, getInput, setFailed } from '@actions/core'
import { context } from '@actions/github'
import {
    decodeMessage,
    errors,
    serviceClients,
    Session,
    waitForOperation,
    WrappedServiceClientType
} from '@yandex-cloud/nodejs-sdk'

import { InstanceGroup } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group'
import {
    CreateInstanceGroupFromYamlRequest,
    InstanceGroupServiceService,
    ListInstanceGroupsRequest,
    UpdateInstanceGroupFromYamlRequest
} from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group_service'
import { Operation } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/operation/operation'
import { readFileSync } from 'fs'
import Mustache from 'mustache'
import { join } from 'path'
import YAML from 'yaml'
import { fromServiceAccountJsonFile } from './service-account-json'

// Partial interface with only fields used in the action.
interface InstanceGroupSpec {
    folder_id?: string
    name: string
    description: string | undefined
}

interface InstanceGroupUpdateSpec {
    instance_group_id: string
    name: string
    description: string | undefined
}

async function findIg(
    instanceGroupService: WrappedServiceClientType<typeof InstanceGroupServiceService>,
    folderId: string,
    name: string
): Promise<string | null> {
    startGroup('Find VM by name')
    const res = await instanceGroupService.list(
        ListInstanceGroupsRequest.fromPartial({
            folderId,
            filter: `name = '${name}'`
        })
    )
    endGroup()
    if (res.instanceGroups.length) {
        return res.instanceGroups[0].id
    }
    return null
}

interface ActionConfig {
    folderId: string
    igSpecPath: string
    userDataPath: string
    dockerComposePath: string
    apiEndpoint: string
}

function prepareConfig(filePath: string): string {
    const workspace = process.env['GITHUB_WORKSPACE'] ?? ''
    const content = readFileSync(join(workspace, filePath)).toString()

    return Mustache.render(content, { env: { ...process.env } }, {}, { escape: x => x })
}

function prepareIgSpec(filePath: string, metadata: { userData: string; dockerCompose: string }): InstanceGroupSpec {
    const workspace = process.env['GITHUB_WORKSPACE'] ?? ''
    const content = readFileSync(join(workspace, filePath)).toString()

    const rendered = Mustache.render(content, { env: { ...process.env } }, {}, { escape: x => x })

    const spec = YAML.parse(rendered)

    const specMetadata = spec.instance_template?.metadata ?? {}
    spec.instance_template.metadata = {
        ...specMetadata,
        'user-data': metadata.userData,
        'docker-compose': metadata.dockerCompose
    }
    return spec
}

function getInstanceFromOperation(op: Operation): InstanceGroup | undefined {
    const v = op.response?.value
    if (v !== undefined) {
        return InstanceGroup.decode(v)
    }
}

function setOutputs(op: Operation): void {
    const ig = getInstanceFromOperation(op)
    setOutput('instance-group-id', ig?.id)
}

async function createIg(
    session: Session,
    instanceGroupService: WrappedServiceClientType<typeof InstanceGroupServiceService>,
    instanceGroupSpec: InstanceGroupSpec
): Promise<void> {
    startGroup('Create new Instance Group')

    const op = await instanceGroupService.createFromYaml(
        CreateInstanceGroupFromYamlRequest.fromPartial({
            folderId: instanceGroupSpec.folder_id,
            instanceGroupYaml: YAML.stringify(instanceGroupSpec)
        })
    )
    const finishedOp = await waitForOperation(op, session)
    if (finishedOp.response) {
        const igId = decodeMessage<InstanceGroup>(finishedOp.response).id
        info(`Created instance with id '${igId}'`)
        setOutput('created', 'true')
    } else {
        error(`Failed to create instance group`)
        throw new Error('Failed to create instance group')
    }
    setOutputs(finishedOp)
    endGroup()
}

async function updateIg(
    session: Session,
    instanceGroupService: WrappedServiceClientType<typeof InstanceGroupServiceService>,
    igId: string,
    instanceGroupSpec: InstanceGroupSpec
): Promise<Operation> {
    startGroup('Update Instance Group')

    setOutput('created', 'false')
    delete instanceGroupSpec.folder_id
    const updateSpec: InstanceGroupUpdateSpec = {
        instance_group_id: igId,
        ...instanceGroupSpec
    }
    const op = await instanceGroupService.updateFromYaml(
        UpdateInstanceGroupFromYamlRequest.fromPartial({
            instanceGroupId: igId,
            instanceGroupYaml: YAML.stringify(updateSpec)
        })
    )
    const finishedOp = await waitForOperation(op, session)
    if (finishedOp.response) {
        info(`Updated instance group with id '${igId}'`)
    } else {
        error(`Failed to update instance group`)
        throw new Error('Failed to update instance group')
    }
    setOutputs(op)
    endGroup()
    return op
}

function parseInputs(): ActionConfig {
    startGroup('Parsing Action Inputs')

    const folderId: string = getInput('folder-id', {
        required: true
    })
    const igSpecPath: string = getInput('ig-spec-path', { required: true })
    const userDataPath: string = getInput('user-data-path', {
        required: true
    })
    const dockerComposePath: string = getInput('docker-compose-path', {
        required: true
    })

    const apiEndpoint: string = getInput('api-endpoint', {
        required: false
    })

    endGroup()
    return {
        folderId,
        igSpecPath,
        userDataPath,
        dockerComposePath,
        apiEndpoint
    }
}

export async function run(): Promise<void> {
    try {
        info(`start`)
        const ycSaJsonCredentials = getInput('yc-sa-json-credentials', {
            required: true
        })

        const config = parseInputs()

        info(`Folder ID: ${config.folderId}`)

        const serviceAccountJson = fromServiceAccountJsonFile(JSON.parse(ycSaJsonCredentials))
        info('Parsed Service account JSON')

        const session = new Session({ serviceAccountJson })
        const instanceGroupService = session.client(serviceClients.InstanceGroupServiceClient)

        const userData = prepareConfig(config.userDataPath)
        const dockerCompose = prepareConfig(config.dockerComposePath)

        const spec = prepareIgSpec(config.igSpecPath, { userData, dockerCompose })

        spec.folder_id = config.folderId
        if (!spec.description) {
            const { repo } = context
            spec.description = `Created from: ${repo.owner}/${repo.repo}`
        }

        const igId = await findIg(instanceGroupService, config.folderId, spec.name)
        if (igId === null) {
            await createIg(session, instanceGroupService, spec)
        } else {
            await updateIg(session, instanceGroupService, igId, spec)
        }
    } catch (err) {
        if (err instanceof errors.ApiError) {
            error(`${err.message}\nx-request-id: ${err.requestId}\nx-server-trace-id: ${err.serverTraceId}`)
        }
        setFailed(err as Error)
    }
}
