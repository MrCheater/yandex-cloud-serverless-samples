# yandex-cloud-serverless-samples

#### Usage
```
$ yarn build && yarn deploy --name=capybara

$ ts-node scripts/build.ts
Start building: capybara

$ tsc
* ~/yandex-cloud-serverless-samples/.cloud-functions/capybara.zip [ 741.3 KB ]
Finished building: capybara
Done in 3.03s.

$ ts-node scripts/deploy.ts --name=capybara
Creating Function...
Deploying version...
Creating API Gateway...
https://d5dn5viopst5a0h5takb.apigw.yandexcloud.net
Done in 7.64s.
```

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

#### CLI
```sh
Usage:
  yc serverless api-gateway <command>

Commands:
  get                   Get api-gateway
  list                  List api-gateways
  get-spec              Get api-gateway openapi specification
  create                Create api-gateway
  update                Update api-gateway
  delete                Delete api-gateway
  list-operations       List api-gateway operations
  list-access-bindings  List api-gateway access bindings
  set-access-bindings   Set access bindings for the specified api-gateway and delete all existing access bindings if there were 
                        any 
  add-access-binding    Add access binding for the specified api-gateway
  remove-access-binding Remove access binding for the specified api-gateway
```
```sh
Usage:
  yc serverless function <group|command>

Groups:
  version                      Manage function versions
  runtime                      Inspect function runtimes

Commands:
  get                          Show information about the specified function
  list                         List functions
  create                       Create a function
  update                       Update the specified function
  add-labels                   Add labels to specified function
  remove-labels                Remove labels from specified function
  delete                       Delete the specified function
  tag-history                  Show history of the tag for the specified function
  list-operations              Show operations for the specified function
  logs                         Show logs for the specified function
  invoke                       Invoke the specified function
  list-access-bindings         List access bindings for the specified function
  set-access-bindings          Set access bindings for the specified function and delete all existing access bindings if there 
                               were any 
  add-access-binding           Add access binding for the specified function
  remove-access-binding        Remove access binding for the specified function
  allow-unauthenticated-invoke Allow unauthenticated invoke for the specified function
  deny-unauthenticated-invoke  Deny unauthenticated invoke for the specified function
```


#### Bug Tracker
https://console.cloud.yandex.ru/support/create-ticket 
