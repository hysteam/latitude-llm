import { McpTool } from '@latitude-data/constants'
import { JSONSchema7 } from 'json-schema'
import { IntegrationDto } from '../../../../browser'
import { LatitudeError } from '../../../../lib/errors'
import { Result } from '../../../../lib/Result'
import { StreamManager } from '../../../../lib/streamManager'
import { PromisedResult } from '../../../../lib/Transaction'
import { touchIntegration } from '../../touch'
import { getMcpClient } from '../McpClientManager'
import { fixToolSchema } from './fixToolSchema'

export async function listTools(
  integration: IntegrationDto,
  streamManager?: StreamManager,
): PromisedResult<McpTool[], LatitudeError> {
  const clientResult = await getMcpClient(integration, streamManager)
  if (clientResult.error) {
    return clientResult
  }
  const client = clientResult.unwrap()

  try {
    const { tools } = await client.listTools()

    const touchResult = await touchIntegration(integration.id)
    if (touchResult.error) {
      return Result.error(new LatitudeError(touchResult.error.message))
    }

    const fixedTools = tools.map((tool) => ({
      ...tool,
      inputSchema: fixToolSchema(tool.inputSchema as JSONSchema7),
    }))

    return Result.ok(fixedTools as McpTool[])
  } catch (err) {
    const error = err as Error
    return Result.error(
      new LatitudeError(
        `Error listing tools from Integration '${integration.name}': ${error.message}`,
      ),
    )
  }
}
