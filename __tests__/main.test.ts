/**
 * Unit tests for the action's main functionality, src/main.ts
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as sdk from '@yandex-cloud/nodejs-sdk'
import { WrappedServiceClientType } from '@yandex-cloud/nodejs-sdk'
import * as github from '@actions/github'
import yaml from 'yaml'

import { ServiceAccount } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/iam/v1/service_account'
import { InstanceGroup } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group'
import { InstanceGroupServiceService } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group_service'

declare module '@yandex-cloud/nodejs-sdk' {
    function __setComputeInstanceGroupList(value: InstanceGroup[]): void

    function __setServiceAccountList(value: ServiceAccount[]): void

    function __setCreateInstanceGroupFail(value: boolean): void

    function __setUpdateInstanceGroupFail(value: boolean): void

    const __InstanceGroupServiceMock: jest.Mocked<WrappedServiceClientType<typeof InstanceGroupServiceService>>
}

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

// yandex sdk mock

const requiredInputs: Record<string, string> = {
    'yc-sa-json-credentials': `{
    "id": "id",
    "created_at": "2021-01-01T00:00:00Z", 
    "key_algorithm": "RSA_2048",
    "service_account_id": "service_account_id",
    "private_key": "private_key",
    "public_key": "public_key"
  }`,
    'folder-id': 'folderid',
    'vm-zone-id': 'ru-central1-a',
    'vm-subnet-id': 'subnetid',
    'user-data-path': '__tests__/user-data.yaml',
    'docker-compose-path': '__tests__/docker-compose.yaml',
    'ig-spec-path': '__tests__/ig-spec.yaml'
}

const defaultInputs: Record<string, string> = {
    ...requiredInputs
}
describe('action', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        errorMock = jest.spyOn(core, 'error').mockImplementation()
        getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
        setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
        setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
        jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
            return {
                owner: 'some-owner',
                repo: 'some-repo'
            }
        })
        sdk.__setServiceAccountList([
            ServiceAccount.fromJSON({
                id: 'serviceaccountid'
            })
        ])
        sdk.__setCreateInstanceGroupFail(false)
        sdk.__setUpdateInstanceGroupFail(false)
    })

    it('updates IG when there is one', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            const inputs = {
                ...defaultInputs
            }

            return inputs[name] || ''
        })

        process.env.GITHUB_REPOSITORY = 'owner/repo'
        process.env.GITHUB_SHA = 'sha'

        sdk.__setComputeInstanceGroupList([
            InstanceGroup.fromJSON({
                id: 'instanceid',
                metadata: {
                    'user-data': 'userdata',
                    'docker-compose': 'dockercompose'
                }
            })
        ])

        await main.run()
        expect(runMock).toHaveReturned()
        expect(errorMock).not.toHaveBeenCalled()
        expect(setFailedMock).not.toHaveBeenCalled()
        expect(setOutputMock).toHaveBeenCalledWith('created', 'false')
        expect(setOutputMock).toHaveBeenCalledWith('instance-group-id', 'instanceGroupId')
    })

    it('creates IG when there is none', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            const inputs = {
                ...defaultInputs
            }

            return inputs[name] || ''
        })

        sdk.__setComputeInstanceGroupList([])

        await main.run()
        expect(runMock).toHaveReturned()
        expect(errorMock).not.toHaveBeenCalled()
        expect(setFailedMock).not.toHaveBeenCalled()
        expect(setOutputMock).toHaveBeenCalledWith('created', 'true')
        expect(setOutputMock).toHaveBeenCalledWith('instance-group-id', 'instanceGroupId')
    })

    it('adds description to IG when there is none', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            const inputs: Record<string, string> = {
                ...defaultInputs,
                'ig-spec-path': '__tests__/ig-spec-no-description.yaml'
            }

            return inputs[name] || ''
        })

        sdk.__setComputeInstanceGroupList([])

        await main.run()
        expect(runMock).toHaveReturned()
        expect(errorMock).not.toHaveBeenCalled()

        const callYaml = yaml.parse(sdk.__InstanceGroupServiceMock.createFromYaml.mock.calls[0][0].instanceGroupYaml)
        expect(callYaml.description).toEqual('Created from: some-owner/some-repo')
        expect(setFailedMock).not.toHaveBeenCalled()
        expect(setOutputMock).toHaveBeenCalledWith('created', 'true')
        expect(setOutputMock).toHaveBeenCalledWith('instance-group-id', 'instanceGroupId')
    })

    it('reports if could not update IG', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            const inputs = {
                ...defaultInputs
            }

            return inputs[name] || ''
        })

        sdk.__setComputeInstanceGroupList([
            InstanceGroup.fromJSON({
                id: 'instanceid'
            })
        ])
        sdk.__setUpdateInstanceGroupFail(true)

        await main.run()
        expect(runMock).toHaveReturned()
        expect(errorMock).toHaveBeenCalled()
        expect(setFailedMock).toHaveBeenCalled()
    })

    it('reports if could not create IG', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            const inputs = {
                ...defaultInputs
            }

            return inputs[name] || ''
        })

        sdk.__setComputeInstanceGroupList([])
        sdk.__setCreateInstanceGroupFail(true)

        await main.run()
        expect(runMock).toHaveReturned()
        expect(errorMock).toHaveBeenCalled()
        expect(setFailedMock).toHaveBeenCalled()
    })
})
