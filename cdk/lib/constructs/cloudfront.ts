import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface CloudFrontConstructProps {
  frontendBucket: s3.IBucket;
  ecsInstanceDnsName: string;
  ecsOriginId: string;
  instanceTagName: string;
}

export class CloudFrontConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontConstructProps) {
    super(scope, id);

    const { frontendBucket, ecsInstanceDnsName, ecsOriginId, instanceTagName } = props;
    const stack = cdk.Stack.of(this);

    // Edge Lambda Role
    const edgeLambdaRole = new iam.Role(this, 'EdgeLambdaRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com'),
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    edgeLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ec2:DescribeInstances'],
        resources: ['*'],
      }),
    );
    edgeLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ec2:StartInstances'],
        resources: [`arn:aws:ec2:${stack.region}:${stack.account}:instance/*`],
        conditions: { StringEquals: { 'aws:ResourceTag/Name': instanceTagName } },
      }),
    );

    // Edge Lambda
    const edgeLambdaCodePath = path.join(__dirname, '../../lambda/edge/index.py');
    const edgeLambdaCode = fs
      .readFileSync(edgeLambdaCodePath, 'utf-8')
      .replace('{{INSTANCE_TAG}}', instanceTagName);

    const edgeLambda = new cloudfront.experimental.EdgeFunction(this, 'EdgeLambda', {
      runtime: lambda.Runtime.PYTHON_3_14,
      handler: 'index.handler',
      code: lambda.Code.fromInline(edgeLambdaCode),
      role: edgeLambdaRole,
      timeout: cdk.Duration.seconds(5),
    });

    // Security Headers Policy
    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      'SecurityHeadersPolicy',
      {
        securityHeadersBehavior: {
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
            preload: true,
          },
          contentTypeOptions: { override: true },
          frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
          xssProtection: { protection: true, modeBlock: true, override: true },
        },
      },
    );

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeadersPolicy,
        compress: true,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(ecsInstanceDnsName, {
            originId: ecsOriginId,
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            httpPort: 3001,
            connectionTimeout: cdk.Duration.seconds(3),
            connectionAttempts: 1,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          responseHeadersPolicy: securityHeadersPolicy,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          edgeLambdas: [
            {
              functionVersion: edgeLambda.currentVersion,
              eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
            },
          ],
        },
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });
  }
}
