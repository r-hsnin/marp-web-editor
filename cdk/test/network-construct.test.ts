import { describe, test } from 'bun:test';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkConstruct } from '../lib/constructs/network.js';

describe('NetworkConstruct', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  new NetworkConstruct(stack, 'Network');
  const template = Template.fromStack(stack);

  test('creates VPC with single AZ and public subnet', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 1);
    template.hasResourceProperties('AWS::EC2::Subnet', {
      MapPublicIpOnLaunch: true,
    });
  });

  test('creates security group with CloudFront prefix list ingress', () => {
    template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
    template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
      IpProtocol: 'tcp',
      FromPort: 3001,
      ToPort: 3001,
      SourcePrefixListId: 'pl-3b927c52',
    });
  });

  test('does not create NAT gateway', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 0);
  });
});
