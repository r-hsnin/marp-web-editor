import * as cdk from 'aws-cdk-lib';
import type * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import {
  CloudFrontConstruct,
  Ec2Construct,
  LambdaConstruct,
  NetworkConstruct,
} from './constructs/index.js';

interface ComputeStackProps extends cdk.StackProps {
  environment?: string;
  instanceType?: string;
  idleMinutes?: number;
  aiProvider?: string;
  aiModel?: string;
  imageBucket: s3.IBucket;
  ecrRepository: ecr.IRepository;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const environment = props.environment ?? 'prod';
    const instanceType = props.instanceType ?? 't4g.small';
    const idleMinutes = props.idleMinutes ?? 30;
    const instanceTagName = `marp-editor-${environment}`;
    const ecsOriginId = 'BackendOrigin';

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

    // EC2 + Docker
    const ec2 = new Ec2Construct(this, 'Ec2', {
      vpc: network.vpc,
      securityGroup: network.securityGroup,
      imageBucket: props.imageBucket,
      ecrRepositoryArn: props.ecrRepository.repositoryArn,
      ecrRepositoryUri: props.ecrRepository.repositoryUri,
      instanceType,
      instanceTagName,
      aiProvider: props.aiProvider,
      aiModel: props.aiModel,
    });

    // CloudFront
    const cf = new CloudFrontConstruct(this, 'CloudFront', {
      frontendBucket,
      ecsInstanceDnsName: ec2.instance.attrPublicDnsName,
      ecsOriginId,
      instanceTagName,
    });

    // Management Lambdas (OriginUpdate, IdleCheck)
    new LambdaConstruct(this, 'Lambda', {
      instanceId: ec2.instance.ref,
      distributionId: cf.distribution.distributionId,
      ecsOriginId,
      idleMinutes,
    });

    // Outputs
    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: cf.distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: cf.distribution.distributionId });
    new cdk.CfnOutput(this, 'InstanceId', { value: ec2.instance.ref });
    new cdk.CfnOutput(this, 'FrontendBucketName', { value: frontendBucket.bucketName });
  }
}
