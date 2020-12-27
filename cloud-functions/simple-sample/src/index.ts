import { LambdaEvent, LambdaResult } from './types'

export async function handler(event: LambdaEvent): LambdaResult {
  return {
    statusCode: 200,
    body: "QQQ",
  };
}
