import * as cdk from '@aws-cdk/core'
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda'
import { CfnApi, CfnStage } from '@aws-cdk/aws-apigatewayv2'
import { ServicePrincipal } from '@aws-cdk/aws-iam'

export interface ApiProps extends cdk.StackProps {
  stage: string
  openApi: any
}

interface IntegrationSetting {
  readonly type: string
  readonly httpMethod: string
  readonly uri: string
  readonly payloadFormatVersion: string
}

export class ApiStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: ApiProps) {
    super(scope, id, props)

    const myFunction = new Function(this, 'myFunction', {
      code: Code.fromAsset('dist/handler'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_14_X
    })

    const integrationSetting: IntegrationSetting = {
      type: 'AWS_PROXY',
      httpMethod: 'POST',
      uri: myFunction.functionArn,
      payloadFormatVersion: '2.0'
    }

    Object.entries(props.openApi.paths).forEach(([ path ]) => {
      Object.entries(props.openApi.paths[path]).forEach(([ method ]) => {
        props.openApi.paths[path][method]['x-amazon-apigateway-integration'] = integrationSetting
      })
    })

    const api = new CfnApi(this, 'httpApi', {
      body: props.openApi
    })

    new CfnStage(this, `api-${props.stage}`, {
      apiId: api.ref,
      stageName: '$default',
      autoDeploy: true,
    })

    myFunction.addPermission(
      'myFunctionPermission',
      {
        principal: new ServicePrincipal('apigateway.amazonaws.com'),
        action: 'lambda:InvokeFunction',
        sourceArn: `arn:aws:execute-api:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:${api.ref}/*/*/*`
      }
    )

    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: api.attrApiEndpoint ?? 'Something went wrong with the deploy'
    })
  }
}