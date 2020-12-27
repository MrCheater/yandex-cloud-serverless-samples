import * as t from 'io-ts'
import { CookieSerializeOptions } from 'cookie'

export type LambdaEvent  = {
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'OPTIONS' | 'TRACE',
  multiValueHeaders: Record<string, Array<string>>,
  url: string,
  multiValueQueryStringParameters: Record<string, Array<string>>,
  body: string,
  requestContext: {
    identity: {
      sourceIp: string,
      userAgent: string
    }
  },
})


export const LambdaResult = t.type({
  statusCode: number
  multiValueQueryStringParameters: Record<string, Array<string>>
  body: string
})


export type Encoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'latin1'
  | 'binary'
  | 'hex'

export type InternalRequest<Context extends any> = {
  context: Context
  method: string
  path: string
  headers: Record<string, string | undefined>
  cookies: Record<string, string>
  query<T extends t.Type<any>>(schema: T): t.TypeOf<T>
  body<T extends t.Type<any>>(schema: T): t.TypeOf<T>
  params<T extends t.Type<any>>(schema: T): t.TypeOf<T>
}

export type InternalResponseData = {
  status: number
  headers: Record<string, string>
  cookies: Array<string>
  body: Buffer | string
  closed: boolean
}

export type InternalResponse = {
  INTERNAL: InternalResponseData
  cookie: (
    name: string,
    value: string,
    options?: CookieSerializeOptions | undefined
  ) => InternalResponse
  clearCookie: (name: string, options?: CookieSerializeOptions | undefined) => InternalResponse
  status: (code: number) => InternalResponse
  redirect: (path: string, code?: number | undefined) => InternalResponse
  getHeader: (searchKey: string) => string | null
  setHeader: (key: string, value: string) => InternalResponse
  text: (content: string, encoding?: Encoding | undefined) => InternalResponse
  json: (content: Record<string, any> | Array<any> | null) => InternalResponse
  end: (content?: string | undefined, encoding?: Encoding | undefined) => InternalResponse
  file: (
    content: string | Buffer,
    filename: string,
    encoding: Encoding | undefined
  ) => InternalResponse
}
