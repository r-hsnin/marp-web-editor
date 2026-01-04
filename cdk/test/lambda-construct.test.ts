import { describe, test } from 'bun:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { LambdaConstruct } from '../lib/constructs/lambda.js';

describe('LambdaConstruct', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack', {
    env: { region: 'us-east-1', account: '123456789012' },
  });

  new LambdaConstruct(stack, 'Lambda', {
    instanceId: 'i-1234567890abcdef0',
    distributionId: 'E1234567890ABC',
    ecsOriginId: 'ECSOrigin',
    idleMinutes: 30,
  });

  const template = Template.fromStack(stack);

  test('creates OriginUpdate and IdleCheck Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'python3.14',
      Timeout: 30,
    });
  });

  test('creates EventBridge rule for EC2 state change', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: {
        source: ['aws.ec2'],
        'detail-type': ['EC2 Instance State-change Notification'],
        detail: { state: ['running'] },
      },
    });
  });

  test('creates EventBridge Scheduler for idle check', () => {
    template.hasResourceProperties('AWS::Scheduler::Schedule', {
      ScheduleExpression: 'rate(15 minutes)',
    });
  });

  test('grants minimal IAM permissions for EC2 stop', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'ec2:StopInstances',
            Effect: 'Allow',
            Resource: Match.stringLikeRegexp('.*instance/i-1234567890abcdef0'),
          }),
        ]),
      },
    });
  });

  test('grants CloudFront update permissions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ['cloudfront:GetDistributionConfig', 'cloudfront:UpdateDistribution'],
            Effect: 'Allow',
          }),
        ]),
      },
    });
  });
});
