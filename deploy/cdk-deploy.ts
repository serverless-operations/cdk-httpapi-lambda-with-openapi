#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { ApiStack } from './api-stack'
import * as dotenv from 'dotenv'
dotenv.config()

const SwaggerParser = require('@apidevtools/swagger-parser')

const {
  STAGE = 'dev'
} = process.env

async function createApp(): Promise<cdk.App> {
  const openApi: any = await SwaggerParser.dereference('./deploy/api-definition.yaml')
  const app = new cdk.App()

  
  new ApiStack(app, `MyApiStack-${STAGE}`, {
    stage: STAGE,
    openApi: openApi,
  })

  return app
}
createApp()