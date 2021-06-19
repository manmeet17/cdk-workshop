import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as path from 'path';
import { HitsCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, 'HelloFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda'))
    });

    const hitsCounter = new HitsCounter(this, 'HitsCounter', {
      downstream: fn
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: hitsCounter.handler
    });

    new TableViewer(this, 'ViewHitCounter', {
      title: "Hello Hits",
      table: hitsCounter.dynamoTable,
      sortBy: '-hits'
    })
  }
}
