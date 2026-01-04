#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../lib/compute-stack.js';
import { StatefulStack } from '../lib/stateful-stack.js';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1', // Lambda@Edge requires us-east-1
};

// Context values from CLI or cdk.json
const environment = app.node.tryGetContext('environment') ?? 'prod';
const idleMinutes = Number(app.node.tryGetContext('idleMinutes')) || 30;

const statefulStack = new StatefulStack(app, 'MarpEditorStatefulStack', {
  env,
  environment,
});

new ComputeStack(app, 'MarpEditorComputeStack', {
  env,
  environment,
  idleMinutes,
  imageBucket: statefulStack.imageBucket,
  ecrRepository: statefulStack.ecrRepository,
});
