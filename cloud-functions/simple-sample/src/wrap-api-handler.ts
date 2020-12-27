import contentDisposition from 'content-disposition'
import cookie from 'cookie'
import { parse as parseQuery } from 'query-string'
import {  validate } from 'core'

import { ClientApiEvent, ClientApiResult, InternalRequest, InternalResponse, InternalResponseData } from './types'
import { Context } from '../create-context'

const COOKIE_CLEAR_DATE = new Date(0)

const createRequest = async (
  lambdaEvent: ClientApiEvent,
  context: Context
): Promise<InternalRequest<Context>> => {
  const { uri, httpMethod, headers: originalHeaders, querystring, body } = lambdaEvent

  const cookieHeader = originalHeaders.find(
    (item: { key: string }) => item.key.toLowerCase() === 'cookie'
  )

  const headers: Record<string, string> = originalHeaders
    .filter((item: { key: string; value: string }) => item !== cookieHeader)
    .reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key.toLowerCase()] = item.value
      return acc
    }, {} as Record<string, string>)

  const cookies = cookieHeader != null ? cookie.parse(cookieHeader.value) : {}

  const query = parseQuery(querystring, { arrayFormat: 'bracket' }) as any

  let params = () => ({})

  const req: InternalRequest<Context> = {
    context,
    method: httpMethod,
    path: uri,
    headers,
    cookies,
    query: (schema) => validate(schema, query),
    body: (schema) => validate(schema, JSON.parse(Buffer.from(body, 'base64').toString())),
    get params() {
      return (schema: any) => validate(schema, params())
    },
    set params(value: any) {
      params = value
    },
  }

  return req
}

const createResponse = (): InternalResponse => {
  const internal: InternalResponseData = {
    status: 200,
    headers: {},
    cookies: [],
    body: '',
    closed: false,
  }

  const validateResponseOpened = () => {
    if (internal.closed) {
      throw new Error('Response already sent')
    }
  }

  const validateOptionShape = (
    fieldName: string,
    option: any,
    types: Array<any>,
    nullable = false
  ) => {
    const isValidValue =
      (nullable && option == null) ||
      !(option == null || !types.reduce((acc, type) => acc || option.constructor === type, false))
    if (!isValidValue) {
      throw new Error(
        `Variable "${fieldName}" should be one of following types: ${types.join(', ')}`
      )
    }
  }

  const res: InternalResponse = {
    INTERNAL: internal,
    cookie(name, value, options) {
      validateResponseOpened()
      const serializedCookie = cookie.serialize(name, value, options)

      internal.cookies.push(serializedCookie)
      return res
    },
    clearCookie(name, options) {
      validateResponseOpened()
      const serializedCookie = cookie.serialize(name, '', {
        ...options,
        expires: COOKIE_CLEAR_DATE,
      })

      internal.cookies.push(serializedCookie)
      return res
    },
    status(code) {
      validateResponseOpened()
      validateOptionShape('Status code', code, [Number])
      internal.status = code
      return res
    },
    redirect(path, code) {
      validateResponseOpened()
      validateOptionShape('Status code', code, [Number], true)
      validateOptionShape('Location path', path, [String])
      internal.headers.Location = path
      internal.status = code != null ? code : 302

      internal.closed = true
      return res
    },
    getHeader(searchKey) {
      validateOptionShape('Header name', searchKey, [String])
      return internal.headers[searchKey] ?? null
    },
    setHeader(key, value) {
      validateResponseOpened()
      validateOptionShape('Header name', key, [String])
      validateOptionShape('Header value', value, [String])

      internal.headers[key] = value
      return res
    },
    text(content, encoding) {
      validateResponseOpened()
      validateOptionShape('Text', content, [String])
      validateOptionShape('Encoding', encoding, [String], true)
      internal.body = Buffer.from(content, encoding)
      internal.closed = true
      return res
    },
    json(content) {
      validateResponseOpened()
      internal.headers['Content-Type'] = 'application/json'
      internal.body = JSON.stringify(content)
      internal.closed = true
      return res
    },
    end(content = '', encoding) {
      validateResponseOpened()
      validateOptionShape('Content', content, [String, Buffer])
      validateOptionShape('Encoding', encoding, [String], true)
      internal.body = content.constructor === String ? Buffer.from(content, encoding) : content

      internal.closed = true
      return res
    },
    file(content, filename, encoding) {
      validateResponseOpened()
      validateOptionShape('Content', content, [String, Buffer])
      validateOptionShape('Encoding', encoding, [String], true)
      internal.body = content.constructor === String ? Buffer.from(content, encoding) : content

      internal.headers['Content-Disposition'] = contentDisposition(filename)

      internal.closed = true
      return res
    },
  }

  Object.freeze(res)

  return res
}

const wrapClientApiHandler = async (
  lambdaEvent: ClientApiEvent,
  context: Context,
  handler: (req: InternalRequest<Context>, res: InternalResponse) => Promise<void>
): Promise<ClientApiResult> => {
  try {
    const req = await createRequest(lambdaEvent, context)
    const res = createResponse()

    await handler(req, res)

    const {
      status: httpStatus,
      headers: { ...internalHeaders },
      cookies,
      body: internalBody,
    } = res.INTERNAL
    const body = Buffer.from(internalBody).toString('base64')

    const headers: Array<{ key: string; value: string }> = Object.entries(
      internalHeaders
    ).map(([key, value]) => ({ key, value }))

    return { httpStatus, httpStatusText: getReasonPhrase(httpStatus), headers, body }
  } catch (error) {
    const outError =
      error != null && error.stack != null ? `${error.stack}` : `Unknown error ${error}`

    // eslint-disable-next-line no-console
    console.error(outError)

    return {
      httpStatus: 500,
      httpStatusText: getReasonPhrase(500),
      body: '',
      headers: [],
    }
  }
}

export default wrapClientApiHandler
