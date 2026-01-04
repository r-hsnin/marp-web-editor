import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface Ec2ConstructProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
  imageBucket: s3.IBucket;
  ecrRepositoryArn: string;
  ecrRepositoryUri: string;
  instanceType: string;
  instanceTagName: string;
  aiProvider?: string;
  aiModel?: string;
}

export class Ec2Construct extends Construct {
  public readonly instance: ec2.CfnInstance;
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props: Ec2ConstructProps) {
    super(scope, id);

    const {
      vpc,
      securityGroup,
      imageBucket,
      ecrRepositoryArn,
      ecrRepositoryUri,
      instanceType,
      instanceTagName,
      aiProvider,
      aiModel,
    } = props;

    const stack = cdk.Stack.of(this);

    // CloudWatch Log Group
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/marp-editor/backend',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM Role (least privilege)
    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    // ECR pull permission (specific repository only)
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
          'ecr:BatchCheckLayerAvailability',
        ],
        resources: [ecrRepositoryArn],
      }),
    );
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ecr:GetAuthorizationToken'],
        resources: ['*'],
      }),
    );

    // S3 access for image uploads
    imageBucket.grantReadWrite(role);

    // CloudWatch Logs access
    this.logGroup.grantWrite(role);

    // Instance Profile
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [role.roleName],
    });

    // Build environment variables for container
    const envVars: string[] = [
      '-e NODE_ENV=production',
      '-e IMAGE_STORAGE=s3',
      `-e S3_BUCKET=${imageBucket.bucketName}`,
      `-e S3_REGION=${stack.region}`,
      '-e TMPDIR=/tmp',
      '-e HOME=/tmp',
    ];
    if (aiProvider) envVars.push(`-e AI_PROVIDER=${aiProvider}`);
    if (aiModel) envVars.push(`-e AI_MODEL=${aiModel}`);

    const dockerEnvStr = envVars.join(' ');

    // User Data
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',
      '',
      '# Install Docker',
      'dnf install -y docker',
      'systemctl enable docker',
      'systemctl start docker',
      '',
      '# Save config for future deploys',
      `echo 'ECR_URI=${ecrRepositoryUri}' > /etc/marp-editor.env`,
      `echo 'DOCKER_ENV="${dockerEnvStr}"' >> /etc/marp-editor.env`,
      `echo 'LOG_GROUP=${this.logGroup.logGroupName}' >> /etc/marp-editor.env`,
      '',
      '# ECR Login',
      `aws ecr get-login-password --region ${stack.region} | docker login --username AWS --password-stdin ${ecrRepositoryUri.split('/')[0]}`,
      '',
      '# Pull and run container',
      `docker pull ${ecrRepositoryUri}:latest`,
      `docker run -d \\`,
      '  --name marp-editor \\',
      '  --restart=always \\',
      '  --shm-size=512m \\',
      '  --memory=1536m \\',
      '  --user 1000:1000 \\',
      '  --read-only \\',
      '  --init \\',
      '  -v /tmp:/tmp \\',
      '  -p 3001:3001 \\',
      '  --log-driver=awslogs \\',
      `  --log-opt awslogs-region=${stack.region} \\`,
      `  --log-opt awslogs-group=${this.logGroup.logGroupName} \\`,
      '  --log-opt awslogs-stream=docker \\',
      `  ${dockerEnvStr} \\`,
      `  ${ecrRepositoryUri}:latest`,
    );

    // AMI (Amazon Linux 2023 ARM64)
    const ami = ec2.MachineImage.latestAmazonLinux2023({
      cpuType: ec2.AmazonLinuxCpuType.ARM_64,
    });

    // EC2 Instance
    this.instance = new ec2.CfnInstance(this, 'Instance', {
      instanceType,
      imageId: ami.getImage(this).imageId,
      iamInstanceProfile: instanceProfile.ref,
      subnetId: vpc.publicSubnets[0].subnetId,
      securityGroupIds: [securityGroup.securityGroupId],
      userData: cdk.Fn.base64(userData.render()),
      blockDeviceMappings: [
        {
          deviceName: '/dev/xvda',
          ebs: {
            volumeSize: 8,
            volumeType: 'gp3',
            encrypted: true,
            deleteOnTermination: true,
          },
        },
      ],
      metadataOptions: {
        httpTokens: 'required', // IMDSv2 only
      },
      tags: [{ key: 'Name', value: instanceTagName }],
    });
  }
}
