import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class NetworkConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [{ name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 }],
    });

    this.securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      description: 'ECS Security Group',
      allowAllOutbound: true,
    });
    // CloudFront Managed Prefix List (us-east-1)
    this.securityGroup.addIngressRule(
      ec2.Peer.prefixList('pl-3b927c52'),
      ec2.Port.tcp(3001),
      'Allow from CloudFront only',
    );
  }
}
