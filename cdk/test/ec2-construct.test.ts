import { describe, test } from 'bun:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Ec2Construct } from '../lib/constructs/ec2.js';

describe('Ec2Construct', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack', {
    env: { region: 'us-east-1', account: '123456789012' },
  });

  const vpc = new ec2.Vpc(stack, 'VPC', { maxAzs: 1, natGateways: 0 });
  const sg = new ec2.SecurityGroup(stack, 'SG', { vpc });
  const bucket = new s3.Bucket(stack, 'Bucket');

  new Ec2Construct(stack, 'Ec2', {
    vpc,
    securityGroup: sg,
    imageBucket: bucket,
    ecrRepositoryArn: 'arn:aws:ecr:us-east-1:123456789012:repository/test-repo',
    ecrRepositoryUri: '123456789012.dkr.ecr.us-east-1.amazonaws.com/test-repo',
    instanceType: 't4g.small',
    instanceTagName: 'test-instance',
  });

  const template = Template.fromStack(stack);

  test('creates EC2 instance with correct configuration', () => {
    template.hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't4g.small',
      SubnetId: Match.anyValue(),
      SecurityGroupIds: Match.anyValue(),
    });
  });

  test('creates EC2 instance with 8GB encrypted EBS volume', () => {
    template.hasResourceProperties('AWS::EC2::Instance', {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 8,
            VolumeType: 'gp3',
            Encrypted: true,
            DeleteOnTermination: true,
          },
        },
      ],
    });
  });

  test('creates EC2 instance with IMDSv2 required', () => {
    template.hasResourceProperties('AWS::EC2::Instance', {
      MetadataOptions: {
        HttpTokens: 'required',
      },
    });
  });

  test('creates CloudWatch Log Group', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/marp-editor/backend',
      RetentionInDays: 7,
    });
  });

  test('grants S3 access to EC2 role', () => {
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

  test('grants ECR pull permission to specific repository only', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              'ecr:GetDownloadUrlForLayer',
              'ecr:BatchGetImage',
              'ecr:BatchCheckLayerAvailability',
            ]),
            Effect: 'Allow',
            Resource: 'arn:aws:ecr:us-east-1:123456789012:repository/test-repo',
          }),
        ]),
      },
    });
  });
});
