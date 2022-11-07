import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import {config} from 'dotenv'

config();


export class NewRelicDemoAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const worker = new NodejsFunction(this, 'new-relic-observed-handler', {
      description: 'a worker function to report metrics to New Relic',
      environment: {
        LAUNCHDARKLY_SDK_KEY: process.env.LAUNCHDARKLY_SDK_KEY || '',  
      },
      runtime: Runtime.NODEJS_16_X,
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'new-relic-layer', 'arn:aws:lambda:us-west-2:451483290750:layer:NewRelicNodeJS16X:21')
      ]
    });
  }
}
