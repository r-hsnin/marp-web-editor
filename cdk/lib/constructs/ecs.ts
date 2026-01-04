import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface EcsConstructProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
  imageBucket: s3.IBucket;
  containerImage: string;
  instanceType: string;
  instanceTagName: string;
  desiredCount: number;
  aiProvider?: string;
  aiModel?: string;
}

export class EcsConstruct extends Construct {
  public readonly cluster: ecs.Cluster;
  public readonly instance: ec2.CfnInstance;
  public readonly service: ecs.CfnService;

  constructor(scope: Construct, id: string, props: EcsConstructProps) {
    super(scope, id);

    const {
      vpc,
      securityGroup,
      imageBucket,
      containerImage,
      instanceType,
      instanceTagName,
      desiredCount,
      aiProvider,
      aiModel,
    } = props;

    // Build environment variables
    const containerEnv: Record<string, string> = {
      NODE_ENV: 'production',
      IMAGE_STORAGE: 's3',
      S3_BUCKET: imageBucket.bucketName,
      S3_REGION: cdk.Stack.of(this).region,
      TMPDIR: '/tmp',
      HOME: '/tmp',
    };
    if (aiProvider) containerEnv.AI_PROVIDER = aiProvider;
    if (aiModel) containerEnv.AI_MODEL = aiModel;

    // IAM Roles
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonEC2ContainerServiceforEC2Role',
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    imageBucket.grantReadWrite(taskRole);

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Task Definition
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {
      networkMode: ecs.NetworkMode.BRIDGE,
      executionRole: taskExecutionRole,
      taskRole,
    });

    taskDefinition.addContainer('backend', {
      image: ecs.ContainerImage.fromRegistry(containerImage),
      memoryLimitMiB: 1536,
      user: '1000:1000',
      readonlyRootFilesystem: true,
      essential: true,
      portMappings: [{ containerPort: 3001, hostPort: 3001 }],
      linuxParameters: new ecs.LinuxParameters(this, 'LinuxParams', {
        sharedMemorySize: 512,
        initProcessEnabled: true,
      }),
      environment: containerEnv,
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'ecs' }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3001/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(10),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    taskDefinition.addVolume({ name: 'tmp-volume' });
    taskDefinition.defaultContainer?.addMountPoints({
      sourceVolume: 'tmp-volume',
      containerPath: '/tmp',
      readOnly: false,
    });

    // Instance Profile
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [ec2Role.roleName],
    });

    // EC2 Instance
    this.instance = new ec2.CfnInstance(this, 'Instance', {
      instanceType,
      imageId: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.ARM).getImage(this)
        .imageId,
      iamInstanceProfile: instanceProfile.ref,
      subnetId: vpc.publicSubnets[0].subnetId,
      securityGroupIds: [securityGroup.securityGroupId],
      userData: cdk.Fn.base64(
        `#!/bin/bash\necho ECS_CLUSTER=${this.cluster.clusterName} >> /etc/ecs/ecs.config`,
      ),
      tags: [{ key: 'Name', value: instanceTagName }],
    });

    // ECS Service
    this.service = new ecs.CfnService(this, 'Service', {
      cluster: this.cluster.clusterName,
      taskDefinition: taskDefinition.taskDefinitionArn,
      desiredCount,
      deploymentConfiguration: {
        minimumHealthyPercent: 0,
        maximumPercent: 100,
        deploymentCircuitBreaker: { enable: true, rollback: true },
      },
      launchType: 'EC2',
    });
    this.service.addDependency(this.instance);
  }
}
