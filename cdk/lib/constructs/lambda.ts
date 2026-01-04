import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import { Construct } from 'constructs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface LambdaConstructProps {
  instanceId: string;
  distributionId: string;
  ecsOriginId: string;
  idleMinutes: number;
}

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const { instanceId, distributionId, ecsOriginId, idleMinutes } = props;
    const stack = cdk.Stack.of(this);

    // Origin Update Lambda
    const originUpdateLogGroup = new logs.LogGroup(this, 'OriginUpdateLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const originUpdateLambda = new lambda.Function(this, 'OriginUpdateLambda', {
      runtime: lambda.Runtime.PYTHON_3_14,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/origin-update')),
      timeout: cdk.Duration.seconds(30),
      logGroup: originUpdateLogGroup,
      environment: {
        CLOUDFRONT_DISTRIBUTION_ID: distributionId,
        ORIGIN_ID: ecsOriginId,
      },
    });

    originUpdateLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ec2:DescribeInstances'],
        resources: ['*'],
      }),
    );
    originUpdateLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:GetDistributionConfig', 'cloudfront:UpdateDistribution'],
        resources: [`arn:aws:cloudfront::${stack.account}:distribution/${distributionId}`],
      }),
    );

    new events.Rule(this, 'EC2StartRule', {
      eventPattern: {
        source: ['aws.ec2'],
        detailType: ['EC2 Instance State-change Notification'],
        detail: { state: ['running'], 'instance-id': [instanceId] },
      },
      targets: [new targets.LambdaFunction(originUpdateLambda)],
    });

    // IdleCheck Lambda
    const idleCheckLogGroup = new logs.LogGroup(this, 'IdleCheckLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const idleCheckLambda = new lambda.Function(this, 'IdleCheckLambda', {
      runtime: lambda.Runtime.PYTHON_3_14,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/idle-check')),
      timeout: cdk.Duration.seconds(30),
      logGroup: idleCheckLogGroup,
      environment: {
        INSTANCE_ID: instanceId,
        IDLE_MINUTES: String(idleMinutes),
        CLOUDFRONT_DISTRIBUTION_ID: distributionId,
      },
    });

    idleCheckLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ec2:DescribeInstances'],
        resources: ['*'],
      }),
    );
    idleCheckLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ec2:StopInstances'],
        resources: [`arn:aws:ec2:${stack.region}:${stack.account}:instance/${instanceId}`],
      }),
    );
    idleCheckLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudwatch:GetMetricStatistics'],
        resources: ['*'],
      }),
    );

    // EventBridge Scheduler
    const schedulerRole = new iam.Role(this, 'SchedulerRole', {
      assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
    });
    schedulerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [idleCheckLambda.functionArn],
      }),
    );

    new scheduler.CfnSchedule(this, 'IdleCheckSchedule', {
      scheduleExpression: 'rate(15 minutes)',
      flexibleTimeWindow: { mode: 'OFF' },
      target: { arn: idleCheckLambda.functionArn, roleArn: schedulerRole.roleArn },
    });

    idleCheckLambda.addPermission('SchedulerPermission', {
      principal: new iam.ServicePrincipal('scheduler.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    });
  }
}
