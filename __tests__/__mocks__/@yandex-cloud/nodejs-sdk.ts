/* eslint-disable @typescript-eslint/no-explicit-any */
import { Operation } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/operation/operation'
import { Writer } from 'protobufjs'
import { decodeMessage } from '@yandex-cloud/nodejs-sdk'
import { ServiceAccount } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/iam/v1/service_account'
import { InstanceGroup } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/compute/v1/instancegroup/instance_group'

const sdk: any = jest.createMockFromModule('@yandex-cloud/nodejs-sdk')

let instanceGroups: InstanceGroup[] = []
let serviceAccounts: ServiceAccount[] = [
    ServiceAccount.fromJSON({
        id: 'serviceaccountid'
    })
]

let createInstanceGroupFail = false
let updateInstanceGroupFail = false

const ImageServiceMock = {
    get: jest.fn().mockImplementation(() => ({
        id: 'imageid'
    })),
    getLatestByFamily: jest.fn().mockImplementation(() => ({
        id: 'imageid'
    }))
}

type PayloadClass<T> = {
    $type: string
    encode: (message: T, writer?: Writer) => Writer
    decode: (payload: Uint8Array) => T
    fromJSON: (payload: object) => T
}

function getOperation(payloadClass: PayloadClass<any>, data: object): Operation {
    return Operation.fromJSON({
        id: 'operationid',
        response: {
            typeUrl: payloadClass.$type,
            value: Buffer.from(payloadClass.encode(payloadClass.fromJSON(data)).finish()).toString('base64')
        },
        done: true
    })
}

const InstanceGroupServiceMock = {
    create: jest.fn().mockImplementation(() => {
        return getOperation(InstanceGroup, {
            id: 'instanceGroupId'
        })
    }),
    list: jest.fn().mockImplementation(() => ({
        instanceGroups
    })),
    updateFromYaml: jest.fn().mockImplementation(() => {
        if (updateInstanceGroupFail) {
            return Operation.fromJSON({
                id: 'operationid',
                error: {},
                done: true
            })
        }

        return getOperation(InstanceGroup, {
            id: 'instanceGroupId'
        })
    }),
    createFromYaml: jest.fn().mockImplementation(() => {
        if (createInstanceGroupFail) {
            return Operation.fromJSON({
                id: 'operationid',
                error: {},
                done: true
            })
        }

        return getOperation(InstanceGroup, {
            id: 'instanceGroupId'
        })
    })
}

const ServiceAccountServiceMock = {
    list: jest.fn().mockImplementation(() => ({
        serviceAccounts
    }))
}

sdk.Session = jest.fn().mockImplementation(() => ({
    client: (service: { serviceName: string }) => {
        switch (service.serviceName) {
            case 'yandex.cloud.compute.v1.ImageService':
                return ImageServiceMock
            case 'yandex.cloud.compute.v1.instancegroup.InstanceGroupService':
                return InstanceGroupServiceMock
            case 'yandex.cloud.iam.v1.ServiceAccountService':
                return ServiceAccountServiceMock
            default:
                // handle default case here if needed
                break
        }
    }
}))

sdk.waitForOperation = jest.fn().mockImplementation((op: Operation) => op)
sdk.decodeMessage = decodeMessage

sdk.__setComputeInstanceGroupList = (value: InstanceGroup[]) => {
    instanceGroups = value
}

sdk.__setServiceAccountList = (value: any[]) => {
    serviceAccounts = value
}

sdk.__setCreateInstanceGroupFail = (value: boolean) => {
    createInstanceGroupFail = value
}

sdk.__setUpdateInstanceGroupFail = (value: boolean) => {
    updateInstanceGroupFail = value
}

sdk.__InstanceGroupServiceMock = InstanceGroupServiceMock

export = sdk
