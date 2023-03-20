import {DEFAULT_SERVICE_ENDPOINTS_MAP, ServiceEndpointsMap} from '@yandex-cloud/nodejs-sdk/dist/service-endpoints';

export function serviceMapByEndpoint(endpoint: string): ServiceEndpointsMap {
  switch (endpoint) {
    case 'api.cloudil.com': {
      return NEBIUS_IL_SERVICE_ENDPOINTS_MAP as unknown as ServiceEndpointsMap;
    }
    default:
      return DEFAULT_SERVICE_ENDPOINTS_MAP;
  }
}

export const NEBIUS_IL_SERVICE_ENDPOINTS_MAP = {
  alb: {
    serviceIds: [
      'yandex.cloud.apploadbalancer.v1.BackendGroupService',
      'yandex.cloud.apploadbalancer.v1.HttpRouterService',
      'yandex.cloud.apploadbalancer.v1.LoadBalancerService',
      'yandex.cloud.apploadbalancer.v1.TargetGroupService',
      'yandex.cloud.apploadbalancer.v1.VirtualHostService',
    ],
    endpoint: 'alb.api.cloudil.com:443',
  },
  'certificate-manager': {
    serviceIds: [
      'yandex.cloud.certificatemanager.v1.CertificateContentService',
      'yandex.cloud.certificatemanager.v1.CertificateService',
    ],
    endpoint: 'cpl.ycm.api.cloudil.com:443',
  },
  compute: {
    serviceIds: [
      'yandex.cloud.compute.v1.DiskPlacementGroupService',
      'yandex.cloud.compute.v1.DiskService',
      'yandex.cloud.compute.v1.DiskTypeService',
      'yandex.cloud.compute.v1.FilesystemService',
      'yandex.cloud.compute.v1.HostGroupService',
      'yandex.cloud.compute.v1.HostTypeService',
      'yandex.cloud.compute.v1.ImageService',
      'yandex.cloud.compute.v1.InstanceService',
      'yandex.cloud.compute.v1.PlacementGroupService',
      'yandex.cloud.compute.v1.SnapshotService',
      'yandex.cloud.compute.v1.ZoneService',
      'yandex.cloud.compute.v1.instancegroup.InstanceGroupService',
      'yandex.cloud.compute.v1.SnapshotScheduleService',
    ],
    endpoint: 'compute.api.cloudil.com:443',
  },
  'container-registry': {
    serviceIds: [
      'yandex.cloud.containerregistry.v1.ImageService',
      'yandex.cloud.containerregistry.v1.LifecyclePolicyService',
      'yandex.cloud.containerregistry.v1.RegistryService',
      'yandex.cloud.containerregistry.v1.RepositoryService',
      'yandex.cloud.containerregistry.v1.ScannerService',
    ],
    endpoint: 'container-registry.api.cloudil.com:443',
  },
  dataproc: {
    serviceIds: [
      'yandex.cloud.dataproc.v1.ClusterService',
      'yandex.cloud.dataproc.v1.JobService',
      'yandex.cloud.dataproc.v1.ResourcePresetService',
      'yandex.cloud.dataproc.v1.SubclusterService',
    ],
    endpoint: 'dataproc.api.cloudil.com:443',
  },
  'dataproc-manager': {
    serviceIds: [
      'yandex.cloud.dataproc.manager.v1.JobService',
      'yandex.cloud.dataproc.manager.v1.DataprocManagerService',
    ],
    endpoint: 'dataproc-manager.api.cloudil.com:443',
  },
  datatransfer: {
    serviceIds: ['yandex.cloud.datatransfer.v1.EndpointService', 'yandex.cloud.datatransfer.v1.TransferService'],
    endpoint: 'datatransfer.api.cloudil.com:443',
  },
  dns: {
    serviceIds: ['yandex.cloud.dns.v1.DnsZoneService'],
    endpoint: 'dns.api.cloudil.com:443',
  },
  endpoint: {
    serviceIds: ['yandex.cloud.endpoint.ApiEndpointService'],
    endpoint: 'api.cloudil.com:443',
  },
  iam: {
    serviceIds: [
      'yandex.cloud.iam.v1.ApiKeyService',
      'yandex.cloud.iam.v1.IamTokenService',
      'yandex.cloud.iam.v1.KeyService',
      'yandex.cloud.iam.v1.RoleService',
      'yandex.cloud.iam.v1.ServiceAccountService',
      'yandex.cloud.iam.v1.UserAccountService',
      'yandex.cloud.iam.v1.YandexPassportUserAccountService',
      'yandex.cloud.iam.v1.awscompatibility.AccessKeyService',
    ],
    endpoint: 'iam.api.cloudil.com:443',
  },
  kms: {
    serviceIds: ['yandex.cloud.kms.v1.SymmetricKeyService'],
    endpoint: 'cpl.kms.api.cloudil.com:443',
  },
  'kms-crypto': {
    serviceIds: ['yandex.cloud.kms.v1.SymmetricCryptoService'],
    endpoint: 'dpl.kms.api.cloudil.com:443',
  },
  'load-balancer': {
    serviceIds: [
      'yandex.cloud.loadbalancer.v1.NetworkLoadBalancerService',
      'yandex.cloud.loadbalancer.v1.TargetGroupService',
    ],
    endpoint: 'load-balancer.api.cloudil.com:443',
  },
  lockbox: {
    serviceIds: ['yandex.cloud.lockbox.v1.SecretService'],
    endpoint: 'cpl.lockbox.api.cloudil.com:443',
  },
  'lockbox-payload': {
    serviceIds: ['yandex.cloud.lockbox.v1.PayloadService'],
    endpoint: 'dpl.lockbox.api.cloudil.com:443',
  },
  'log-ingestion': {
    serviceIds: ['yandex.cloud.logging.v1.LogIngestionService'],
    endpoint: 'ingester.logging.cloudil.com:443',
  },
  'log-reading': {
    serviceIds: ['yandex.cloud.logging.v1.LogReadingService'],
    endpoint: 'reader.logging.cloudil.com:443',
  },
  logging: {
    serviceIds: ['yandex.cloud.logging.v1.LogGroupService'],
    endpoint: 'logging.api.cloudil.com:443',
  },
  'managed-kubernetes': {
    serviceIds: [
      'yandex.cloud.k8s.v1.ClusterService',
      'yandex.cloud.k8s.v1.NodeGroupService',
      'yandex.cloud.k8s.v1.VersionService',
    ],
    endpoint: 'mks.api.cloudil.com:443',
  },
  'mdb-redis': {
    serviceIds: [
      'yandex.cloud.mdb.clickhouse.v1.BackupService',
      'yandex.cloud.mdb.clickhouse.v1.ClusterService',
      'yandex.cloud.mdb.clickhouse.v1.DatabaseService',
      'yandex.cloud.mdb.clickhouse.v1.FormatSchemaService',
      'yandex.cloud.mdb.clickhouse.v1.MlModelService',
      'yandex.cloud.mdb.clickhouse.v1.ResourcePresetService',
      'yandex.cloud.mdb.clickhouse.v1.UserService',
      'yandex.cloud.mdb.clickhouse.v1.VersionsService',
      'yandex.cloud.mdb.elasticsearch.v1.AuthService',
      'yandex.cloud.mdb.elasticsearch.v1.ClusterService',
      'yandex.cloud.mdb.elasticsearch.v1.ResourcePresetService',
      'yandex.cloud.mdb.elasticsearch.v1.UserService',
      'yandex.cloud.mdb.elasticsearch.v1.BackupService',
      'yandex.cloud.mdb.elasticsearch.v1.ExtensionService',
      'yandex.cloud.mdb.greenplum.v1.ClusterService',
      'yandex.cloud.mdb.greenplum.v1.BackupService',
      'yandex.cloud.mdb.greenplum.v1.ResourcePresetService',
      'yandex.cloud.mdb.kafka.v1.ClusterService',
      'yandex.cloud.mdb.kafka.v1.ConnectorService',
      'yandex.cloud.mdb.kafka.v1.ResourcePresetService',
      'yandex.cloud.mdb.kafka.v1.TopicService',
      'yandex.cloud.mdb.kafka.v1.UserService',
      'yandex.cloud.mdb.mongodb.v1.BackupService',
      'yandex.cloud.mdb.mongodb.v1.ClusterService',
      'yandex.cloud.mdb.mongodb.v1.DatabaseService',
      'yandex.cloud.mdb.mongodb.v1.ResourcePresetService',
      'yandex.cloud.mdb.mongodb.v1.UserService',
      'yandex.cloud.mdb.mysql.v1.BackupService',
      'yandex.cloud.mdb.mysql.v1.ClusterService',
      'yandex.cloud.mdb.mysql.v1.DatabaseService',
      'yandex.cloud.mdb.mysql.v1.ResourcePresetService',
      'yandex.cloud.mdb.mysql.v1.UserService',
      'yandex.cloud.mdb.postgresql.v1.BackupService',
      'yandex.cloud.mdb.postgresql.v1.ClusterService',
      'yandex.cloud.mdb.postgresql.v1.DatabaseService',
      'yandex.cloud.mdb.postgresql.v1.ResourcePresetService',
      'yandex.cloud.mdb.postgresql.v1.UserService',
      'yandex.cloud.mdb.redis.v1.BackupService',
      'yandex.cloud.mdb.redis.v1.ClusterService',
      'yandex.cloud.mdb.redis.v1.ResourcePresetService',
      'yandex.cloud.mdb.sqlserver.v1.BackupService',
      'yandex.cloud.mdb.sqlserver.v1.ClusterService',
      'yandex.cloud.mdb.sqlserver.v1.DatabaseService',
      'yandex.cloud.mdb.sqlserver.v1.ResourcePresetService',
      'yandex.cloud.mdb.sqlserver.v1.UserService',
    ],
    endpoint: 'mdb.api.cloudil.com:443',
  },
  operation: {
    serviceIds: ['yandex.cloud.operation.OperationService'],
    endpoint: 'operation.api.cloudil.com:443',
  },
  organizationmanager: {
    serviceIds: [
      'yandex.cloud.organizationmanager.v1.OrganizationService',
      'yandex.cloud.organizationmanager.v1.UserService',
      'yandex.cloud.organizationmanager.v1.saml.CertificateService',
      'yandex.cloud.organizationmanager.v1.saml.FederationService',
      'yandex.cloud.organizationmanager.v1.GroupService',
    ],
    endpoint: 'organization-manager.api.cloudil.com:443',
  },
  resourcemanager: {
    serviceIds: ['yandex.cloud.resourcemanager.v1.CloudService', 'yandex.cloud.resourcemanager.v1.FolderService'],
    endpoint: 'resource-manager.api.cloudil.com:443',
  },
  'storage-api': {
    serviceIds: ['yandex.cloud.storage.v1.BucketService'],
    endpoint: 'storage.api.cloudil.com:443',
  },
  vpc: {
    serviceIds: [
      'yandex.cloud.vpc.v1.AddressService',
      'yandex.cloud.vpc.v1.NetworkService',
      'yandex.cloud.vpc.v1.RouteTableService',
      'yandex.cloud.vpc.v1.SecurityGroupService',
      'yandex.cloud.vpc.v1.SubnetService',
      'yandex.cloud.vpc.v1.GatewayService',
    ],
    endpoint: 'vpc.api.cloudil.com:443',
  },
  ydb: {
    serviceIds: [
      'yandex.cloud.ydb.v1.BackupService',
      'yandex.cloud.ydb.v1.DatabaseService',
      'yandex.cloud.ydb.v1.LocationService',
      'yandex.cloud.ydb.v1.ResourcePresetService',
      'yandex.cloud.ydb.v1.StorageTypeService',
    ],
    endpoint: 'ydb.api.cloudil.com:443',
  },
};
