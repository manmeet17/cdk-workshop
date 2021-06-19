import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as path from 'path';

export interface HitCounterProps {
  downstream: lambda.IFunction
}

export class HitsCounter extends cdk.Construct {

  public readonly handler: lambda.Function;
  public readonly dynamoTable: dynamo.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    this.dynamoTable = new dynamo.Table(this, 'Hits', {
      partitionKey: {
        name: 'path',
        type: dynamo.AttributeType.STRING
      }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.dynamoTable.tableName
      }
    });

    // grant the lambda role read/write permissions to our table
    this.dynamoTable.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);

  }
}