import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

interface StatefulStackProps extends cdk.StackProps {
  environment?: string;
}

export class StatefulStack extends cdk.Stack {
  public readonly imageBucket: s3.Bucket;
  public readonly ecrRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: StatefulStackProps) {
    super(scope, id, props);

    const environment = props?.environment ?? 'prod';

    // Tags
    cdk.Tags.of(this).add('Project', 'marp-editor');
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ManagedBy', 'cdk');

    // ECR
    this.ecrRepository = new ecr.Repository(this, 'ECRRepository', {
      imageScanOnPush: true,
      lifecycleRules: [{ maxImageCount: 3 }],
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Stateful: retain on delete
    });

    // S3 Bucket for uploaded images (stateful)
    this.imageBucket = new s3.Bucket(this, 'ImageBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Stateful: retain on delete
    });

    // Outputs
    new cdk.CfnOutput(this, 'ECRRepositoryUri', {
      value: this.ecrRepository.repositoryUri,
      exportName: `${id}-ECRRepositoryUri`,
    });
    new cdk.CfnOutput(this, 'ImageBucketName', {
      value: this.imageBucket.bucketName,
      exportName: `${id}-ImageBucketName`,
    });
  }
}
