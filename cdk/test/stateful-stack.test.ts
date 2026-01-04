import { describe, test } from 'bun:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { StatefulStack } from '../lib/stateful-stack.js';

describe('StatefulStack', () => {
  const app = new cdk.App();
  const stack = new StatefulStack(app, 'TestStatefulStack', { environment: 'test' });
  const template = Template.fromStack(stack);

  test('creates ECR repository with scan on push and RETAIN policy', () => {
    template.hasResourceProperties('AWS::ECR::Repository', {
      ImageScanningConfiguration: { ScanOnPush: true },
    });
    template.hasResource('AWS::ECR::Repository', {
      UpdateReplacePolicy: 'Retain',
      DeletionPolicy: 'Retain',
    });
  });

  test('creates S3 bucket with block public access and RETAIN policy', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
    template.hasResource('AWS::S3::Bucket', {
      UpdateReplacePolicy: 'Retain',
      DeletionPolicy: 'Retain',
    });
  });

  test('exports ECR URI and bucket name', () => {
    template.hasOutput('ECRRepositoryUri', {});
    template.hasOutput('ImageBucketName', {});
  });

  test('applies project tags', () => {
    template.hasResourceProperties('AWS::ECR::Repository', {
      Tags: Match.arrayWith([{ Key: 'Project', Value: 'marp-editor' }]),
    });
  });
});
