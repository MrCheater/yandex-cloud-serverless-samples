# yandex-cloud-serverless-samples

#### Getting started with the command-line interface
https://cloud.yandex.com/docs/cli/quickstart

#### Cloud Function Event / API Gateway Event
Context: https://cloud.yandex.com/docs/functions/lang/nodejs/context
```json
{
  "httpMethod": "GET",
  "headers": {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
    "Referer": "https://console.cloud.yandex.ru/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36",
    "X-Real-Remote-Address": "[128.74.52.94]:43310",
    "X-Request-Id": "daf60d95-007e-44d3-8d06-1dfdd83f0ce0",
    "X-Trace-Id": "34bfc163-d55c-489b-9c5c-7dc6ca5f6c32"
  },
  "url": "",
  "params": {},
  "multiValueParams": {},
  "pathParams": {},
  "multiValueHeaders": {
    "Accept": [
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
    ],
    "Accept-Encoding": [
      "gzip, deflate, br"
    ],
    "Accept-Language": [
      "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6"
    ],
    "Referer": [
      "https://console.cloud.yandex.ru/"
    ],
    "Sec-Fetch-Dest": [
      "document"
    ],
    "Sec-Fetch-Mode": [
      "navigate"
    ],
    "Sec-Fetch-Site": [
      "cross-site"
    ],
    "Sec-Fetch-User": [
      "?1"
    ],
    "Upgrade-Insecure-Requests": [
      "1"
    ],
    "User-Agent": [
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
    ],
    "X-Real-Remote-Address": [
      "[128.74.52.94]:43310"
    ],
    "X-Request-Id": [
      "daf60d95-007e-44d3-8d06-1dfdd83f0ce0"
    ],
    "X-Trace-Id": [
      "34bfc163-d55c-489b-9c5c-7dc6ca5f6c32"
    ]
  },
  "queryStringParameters": {},
  "multiValueQueryStringParameters": {},
  "requestContext": {
    "identity": {
      "sourceIp": "128.74.52.94",
      "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
    },
    "httpMethod": "GET",
    "requestId": "daf60d95-007e-44d3-8d06-1dfdd83f0ce0",
    "requestTime": "23/Dec/2020:17:33:38 +0000",
    "requestTimeEpoch": 1608744818
  },
  "body": "",
  "isBase64Encoded": true
}
```

#### API Gateway Config
Specification: http://spec.openapis.org/oas/v3.0.0
```yaml
openapi: 3.0.0
info:
  title: Capybara API
  version: 1.0.0
servers:
- url: https://d5dn5viopst5a0h5takb.apigw.yandexcloud.net
paths:
  /:
    get:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: d4eqheufctq3hc0p94pt
  /{*}:
    get:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: d4eqheufctq3hc0p94pt
      parameters:
      - description: a
        explode: false
        in: path
        name: '*'
        required: false
        style: simple
```

#### Bug Tracker
https://console.cloud.yandex.ru/support/create-ticket 
