import { describe, test } from 'bun:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { EcsConstruct } from '../lib/constructs/ecs.js';

describe('EcsConstruct', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack', {
    env: { region: 'us-east-1', account: '123456789012' },
  });

  const vpc = new ec2.Vpc(stack, 'VPC', { maxAzs: 1, natGateways: 0 });
  const sg = new ec2.SecurityGroup(stack, 'SG', { vpc });
  const bucket = new s3.Bucket(stack, 'Bucket');

  new EcsConstruct(stack, 'Ecs', {
    vpc,
    securityGroup: sg,
    imageBucket: bucket,
    containerImage: 'test-image',
    instanceType: 't4g.small',
    instanceTagName: 'test-instance',
    desiredCount: 1,
  });

  const template = Template.fromStack(stack);

  test('creates ECS cluster', () => {
    template.resourceCountIs('AWS::ECS::Cluster', 1);
  });

  test('creates EC2 instance with correct configuration', () => {
    template.hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't4g.small',
      SubnetId: Match.anyValue(),
      SecurityGroupIds: Match.anyValue(),
    });
  });

  test('creates task definition with container health check', () => {
    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Essential: true,
          HealthCheck: Match.objectLike({
            Command: ['CMD-SHELL', 'curl -f http://localhost:3001/health || exit 1'],
          }),
        }),
      ]),
    });
  });

  test('creates ECS service with circuit breaker', () => {
    template.hasResourceProperties('AWS::ECS::Service', {
      DeploymentConfiguration: {
        MinimumHealthyPercent: 0,
        MaximumPercent: 100,
        DeploymentCircuitBreaker: { Enable: true, Rollback: true },
      },
    });
  });

  test('grants S3 access to task role', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(['s3:GetObject*', 's3:PutObject']),
            Effect: 'Allow',
          }),
        ]),
      },
    });
  });
});
