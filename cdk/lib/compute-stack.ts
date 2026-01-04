import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import {
  CloudFrontConstruct,
  EcsConstruct,
  LambdaConstruct,
  NetworkConstruct,
} from './constructs/index.js';

interface ComputeStackProps extends cdk.StackProps {
  environment?: string;
  instanceType?: string;
  containerImage?: string;
  idleMinutes?: number;
  aiProvider?: string;
  aiModel?: string;
  imageBucket: s3.IBucket;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const environment = props.environment ?? 'prod';
    const instanceType = props.instanceType ?? 't4g.small';
    const containerImage = props.containerImage ?? 'amazon/amazon-ecs-sample';
    const idleMinutes = props.idleMinutes ?? 30;
    const instanceTagName = `marp-editor-ecs-${environment}`;
    const ecsOriginId = 'ECSOrigin';
    // Start with 0 tasks on initial deploy (dummy image), 1 after real image is pushed
    const desiredCount = props.containerImage ? 1 : 0;

    // Tags
    cdk.Tags.of(this).add('Project', 'marp-editor');
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ManagedBy', 'cdk');

    // Frontend bucket
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Network
    const network = new NetworkConstruct(this, 'Network');

    // ECS
    const ecs = new EcsConstruct(this, 'Ecs', {
      vpc: network.vpc,
      securityGroup: network.securityGroup,
      imageBucket: props.imageBucket,
      containerImage,
      instanceType,
      instanceTagName,
      desiredCount,
      aiProvider: props.aiProvider,
      aiModel: props.aiModel,
    });

    // CloudFront
    const cf = new CloudFrontConstruct(this, 'CloudFront', {
      frontendBucket,
      ecsInstanceDnsName: ecs.instance.attrPublicDnsName,
      ecsOriginId,
      instanceTagName,
    });

    // Management Lambdas (OriginUpdate, IdleCheck)
    new LambdaConstruct(this, 'Lambda', {
      instanceId: ecs.instance.ref,
      distributionId: cf.distribution.distributionId,
      ecsOriginId,
      idleMinutes,
    });

    // Outputs
    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: cf.distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: cf.distribution.distributionId });
    new cdk.CfnOutput(this, 'ECSClusterName', { value: ecs.cluster.clusterName });
    new cdk.CfnOutput(this, 'InstanceId', { value: ecs.instance.ref });
    new cdk.CfnOutput(this, 'FrontendBucketName', { value: frontendBucket.bucketName });
  }
}
