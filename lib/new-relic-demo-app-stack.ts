/* eslint-disable @typescript-eslint/naming-convention */
import * as cdk from 'aws-cdk-lib';
import type {Construct} from 'constructs';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {LayerVersion, Runtime} from 'aws-cdk-lib/aws-lambda';
import {config} from 'dotenv';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';

config();

export class NewRelicDemoAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here

		const worker = new NodejsFunction(this, 'new-relic-observed-handler', {
			description: 'a worker function to report metrics to New Relic',
			environment: {
				LAUNCHDARKLY_SDK_KEY: process.env.LAUNCHDARKLY_SDK_KEY ?? '',
				NEW_RELIC_LAMBDA_HANDLER: 'index.handler',
				NEW_RELIC_ACCOUNT_ID: process.env.NEW_RELIC_ACCOUNT_ID ?? '',
			},
			runtime: Runtime.NODEJS_16_X,
			layers: [
				LayerVersion.fromLayerVersionArn(this, 'new-relic-layer', 'arn:aws:lambda:us-east-1:451483290750:layer:NewRelicNodeJS16X:21'),
			],
			memorySize: 2048,
			handler: 'newrelic-lambda-wrapper.handler',
			bundling: {
				externalModules: ['newrelic'],
			},
		});

		const newRelicKey = Secret.fromSecretCompleteArn(this, 'new-relic-secret-arn', process.env.NEW_RELIC_SECRET_ARN ?? '');
		newRelicKey.grantRead(worker);
	}
}
