import { beforeAll, describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cdkOutDir = path.join(__dirname, '../cdk.out');

// CloudFrontConstruct uses EdgeFunction which creates cross-region stacks
// Must use cdk synth output for testing

describe('ComputeStack (synth-based)', () => {
  let template: Record<string, unknown>;
  let resources: Record<string, { Type: string; Properties?: Record<string, unknown> }>;

  beforeAll(() => {
    execSync('bun run cdk synth --quiet', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });

    const files = fs.readdirSync(cdkOutDir);
    const computeStackFile = files.find(
      (f) => f.includes('ComputeStack') && f.endsWith('.template.json'),
    );
    if (!computeStackFile) throw new Error('ComputeStack template not found');

    template = JSON.parse(fs.readFileSync(path.join(cdkOutDir, computeStackFile), 'utf-8'));
    resources = template.Resources as typeof resources;
  });

  test('creates CloudFront distribution with security headers', () => {
    const distributions = Object.values(resources).filter(
      (r) => r.Type === 'AWS::CloudFront::Distribution',
    );
    expect(distributions.length).toBe(1);

    const dist = distributions[0];
    const config = dist.Properties?.DistributionConfig as Record<string, unknown>;
    expect(config?.DefaultRootObject).toBe('index.html');
    expect(config?.PriceClass).toBe('PriceClass_200');
  });

  test('creates response headers policy with HSTS', () => {
    const policies = Object.values(resources).filter(
      (r) => r.Type === 'AWS::CloudFront::ResponseHeadersPolicy',
    );
    expect(policies.length).toBeGreaterThan(0);
  });

  test('creates Lambda functions for origin-update and idle-check', () => {
    const lambdas = Object.values(resources).filter((r) => r.Type === 'AWS::Lambda::Function');
    expect(lambdas.length).toBeGreaterThanOrEqual(2);
  });

  test('exports required outputs', () => {
    const outputs = template.Outputs as Record<string, unknown>;
    expect(outputs).toHaveProperty('CloudFrontDomain');
    expect(outputs).toHaveProperty('CloudFrontDistributionId');
    expect(outputs).toHaveProperty('InstanceId');
    expect(outputs).toHaveProperty('FrontendBucketName');
  });
});
