import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  decodeMessage,
  serviceClients,
  Session,
  waitForOperation,
  WrappedServiceClientType,
} from '@yandex-cloud/nodejs-sdk';

import {InstanceGroup} from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group';
import {
  CreateInstanceGroupFromYamlRequest,
  InstanceGroupServiceService,
  ListInstanceGroupsRequest,
  UpdateInstanceGroupFromYamlRequest,
} from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group_service';
import {Operation} from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/operation/operation';
import * as fs from 'fs';
import Mustache from 'mustache';
import * as path from 'path';
import YAML from 'yaml';
import {fromServiceAccountJsonFile} from './service-account-json';

// Partial interface with only fields used in the action.
interface InstanceGroupSpec {
  folder_id?: string;
  name: string;
  description: string | undefined;
}

interface InstanceGroupUpdateSpec {
  instance_group_id: string;
  update_mask: string;
  name: string;
  description: string | undefined;
}

async function findIg(
  instanceService: WrappedServiceClientType<typeof InstanceGroupServiceService>,
  folderId: string,
  name: string,
): Promise<string | null> {
  core.startGroup('Find VM by name');
  const res = await instanceService.list(
    ListInstanceGroupsRequest.fromPartial({
      folderId,
      filter: `name = '${name}'`,
    }),
  );
  core.endGroup();
  if (res.instanceGroups.length) {
    return res.instanceGroups[0].id;
  }
  return null;
}

interface ActionConfig {
  folderId: string;
  igSpecPath: string;
  userDataPath: string;
  dockerComposePath: string;
}

function prepareConfig(filePath: string): string {
  const workspace = process.env['GITHUB_WORKSPACE'] ?? '';
  const content = fs.readFileSync(path.join(workspace, filePath)).toString();

  return Mustache.render(content, {env: {...process.env}}, {}, {escape: x => x});
}

function prepareIgSpec(filePath: string, metadata: {userData: string; dockerCompose: string}): InstanceGroupSpec {
  const workspace = process.env['GITHUB_WORKSPACE'] ?? '';
  const content = fs.readFileSync(path.join(workspace, filePath)).toString();

  const rendered = Mustache.render(content, {env: {...process.env}}, {}, {escape: x => x});

  const spec = YAML.parse(rendered);

  const specMetadata = spec.instance_template?.metadata ?? {};
  spec.instance_template.metadata = {
    ...specMetadata,
    'user-data': metadata.userData,
    'docker-compose': metadata.dockerCompose,
  };
  return spec;
}

function getInstanceFromOperation(op: Operation): InstanceGroup | undefined {
  const v = op.response?.value;
  if (v !== undefined) {
    return InstanceGroup.decode(v);
  }
}

function setOutputs(op: Operation): void {
  const ig = getInstanceFromOperation(op);
  core.setOutput('instance-group-id', ig?.id);
}

async function createIg(
  session: Session,
  instanceGroupService: WrappedServiceClientType<typeof InstanceGroupServiceService>,
  instanceGroupSpec: InstanceGroupSpec,
): Promise<void> {
  core.startGroup('Create new Instance Group');

  const op = await instanceGroupService.createFromYaml(
    CreateInstanceGroupFromYamlRequest.fromPartial({
      folderId: instanceGroupSpec.folder_id,
      instanceGroupYaml: YAML.stringify(instanceGroupSpec),
    }),
  );
  const finishedOp = await waitForOperation(op, session);
  if (finishedOp.response) {
    const igId = decodeMessage<InstanceGroup>(finishedOp.response).id;
    core.info(`Created instance with id '${igId}'`);
    core.setOutput('created', 'true');
  } else {
    core.error(`Failed to create instance group'`);
    throw new Error('Failed to create instance group');
  }
  setOutputs(finishedOp);
  core.endGroup();
}

async function updateIg(
  session: Session,
  instanceGroupService: WrappedServiceClientType<typeof InstanceGroupServiceService>,
  igId: string,
  instanceGroupSpec: InstanceGroupSpec,
): Promise<Operation> {
  core.startGroup('Update Instance Group');

  core.setOutput('created', 'false');
  delete instanceGroupSpec.folder_id;
  const updateSpec: InstanceGroupUpdateSpec = {
    instance_group_id: igId,
    update_mask: Object.keys(instanceGroupSpec).join(','),
    ...instanceGroupSpec,
  };
  const op = await instanceGroupService.updateFromYaml(
    UpdateInstanceGroupFromYamlRequest.fromPartial({
      instanceGroupId: igId,
      instanceGroupYaml: YAML.stringify(updateSpec),
    }),
  );
  const finishedOp = await waitForOperation(op, session);
  if (finishedOp.response) {
    core.info(`Updated instance group with id '${igId}'`);
  } else {
    core.error(`Failed to create instance group'`);
    throw new Error('Failed to create instance group');
  }
  setOutputs(op);
  core.endGroup();
  return op;
}

function parseInputs(): ActionConfig {
  core.startGroup('Parsing Action Inputs');

  const folderId: string = core.getInput('folder-id', {
    required: true,
  });
  const igSpecPath: string = core.getInput('ig-spec-path', {required: true});
  const userDataPath: string = core.getInput('user-data-path', {
    required: true,
  });
  const dockerComposePath: string = core.getInput('docker-compose-path', {
    required: true,
  });

  core.endGroup();
  return {
    folderId,
    igSpecPath,
    userDataPath,
    dockerComposePath,
  };
}

async function run(): Promise<void> {
  try {
    core.info(`start`);
    const ycSaJsonCredentials = core.getInput('yc-sa-json-credentials', {
      required: true,
    });

    const config = parseInputs();

    core.info(`Folder ID: ${config.folderId}`);

    const serviceAccountJson = fromServiceAccountJsonFile(JSON.parse(ycSaJsonCredentials));
    core.info('Parsed Service account JSON');

    const session = new Session({serviceAccountJson});
    const instanceGroupService = session.client(serviceClients.InstanceGroupServiceClient);

    const userData = prepareConfig(config.userDataPath);
    const dockerCompose = prepareConfig(config.dockerComposePath);

    const spec = prepareIgSpec(config.igSpecPath, {userData, dockerCompose});

    spec.folder_id = config.folderId;
    if (!spec.description) {
      const {repo} = github.context;
      spec.description = `Created from: ${repo.owner}/${repo.repo}`;
    }

    const igId = await findIg(instanceGroupService, config.folderId, spec.name);
    if (igId === null) {
      await createIg(session, instanceGroupService, spec);
    } else {
      await updateIg(session, instanceGroupService, igId, spec);
    }
  } catch (error) {
    core.setFailed(error as Error);
  }
}

run();
