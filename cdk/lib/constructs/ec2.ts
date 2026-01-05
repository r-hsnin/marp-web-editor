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

    // SSM Parameter Store access for AI settings
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter', 'ssm:GetParametersByPath'],
        resources: [`arn:aws:ssm:${stack.region}:${stack.account}:parameter/marp-editor/*`],
      }),
    );

    // Bedrock access for AI features
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
        resources: ['*'],
      }),
    );

    // Instance Profile
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [role.roleName],
    });

    // Base environment variables for container
    const baseEnvVars = [
      '-e NODE_ENV=production',
      '-e IMAGE_STORAGE=s3',
      `-e S3_BUCKET=${imageBucket.bucketName}`,
      `-e S3_REGION=${stack.region}`,
      '-e TMPDIR=/tmp',
      '-e HOME=/tmp',
    ].join(' ');

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
      '# Function to get SSM parameter (returns empty string if not found)',
      'get_ssm_param() {',
      `  aws ssm get-parameter --name "$1" --with-decryption --region ${stack.region} --query "Parameter.Value" --output text 2>/dev/null || echo ""`,
      '}',
      '',
      '# Get AI settings from Parameter Store',
      'AI_PROVIDER=$(get_ssm_param "/marp-editor/ai-provider")',
      'AI_MODEL=$(get_ssm_param "/marp-editor/ai-model")',
      'OPENROUTER_API_KEY=$(get_ssm_param "/marp-editor/OPENROUTER_API_KEY")',
      'OPENAI_API_KEY=$(get_ssm_param "/marp-editor/OPENAI_API_KEY")',
      'ANTHROPIC_API_KEY=$(get_ssm_param "/marp-editor/ANTHROPIC_API_KEY")',
      'GOOGLE_GENERATIVE_AI_API_KEY=$(get_ssm_param "/marp-editor/GOOGLE_GENERATIVE_AI_API_KEY")',
      '',
      '# Build Docker environment variables',
      `DOCKER_ENV="${baseEnvVars}"`,
      '[ -n "$AI_PROVIDER" ] && DOCKER_ENV="$DOCKER_ENV -e AI_PROVIDER=$AI_PROVIDER"',
      '[ -n "$AI_MODEL" ] && DOCKER_ENV="$DOCKER_ENV -e AI_MODEL=$AI_MODEL"',
      '[ -n "$OPENROUTER_API_KEY" ] && DOCKER_ENV="$DOCKER_ENV -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY"',
      '[ -n "$OPENAI_API_KEY" ] && DOCKER_ENV="$DOCKER_ENV -e OPENAI_API_KEY=$OPENAI_API_KEY"',
      '[ -n "$ANTHROPIC_API_KEY" ] && DOCKER_ENV="$DOCKER_ENV -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY"',
      '[ -n "$GOOGLE_GENERATIVE_AI_API_KEY" ] && DOCKER_ENV="$DOCKER_ENV -e GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY"',
      '',
      '# Save config for future deploys',
      `echo 'ECR_URI=${ecrRepositoryUri}' > /etc/marp-editor.env`,
      `echo 'LOG_GROUP=${this.logGroup.logGroupName}' >> /etc/marp-editor.env`,
      `echo 'AWS_REGION=${stack.region}' >> /etc/marp-editor.env`,
      `echo 'BASE_DOCKER_ENV="${baseEnvVars}"' >> /etc/marp-editor.env`,
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
      '  --tmpfs /home/bun:rw,noexec,nosuid,uid=1000,gid=1000,size=64m \\',
      '  -p 3001:3001 \\',
      '  --log-driver=awslogs \\',
      `  --log-opt awslogs-region=${stack.region} \\`,
      `  --log-opt awslogs-group=${this.logGroup.logGroupName} \\`,
      '  --log-opt awslogs-stream=docker \\',
      '  $DOCKER_ENV \\',
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
