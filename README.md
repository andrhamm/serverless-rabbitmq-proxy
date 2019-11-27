# rabbitmq-message-proxy

Make calls to RabbitMQ Management API from a Serverless context. The API endpoint (`/publish`) employs API Key authentication. The body of the request is proxied to the `/api/exchanges/vhost/name/publish` endpoint provided by the [RabbitMQ Management HTTP API](https://cdn.rawgit.com/rabbitmq/rabbitmq-management/v3.7.15/priv/www/api/index.html), the credentials for which are encrypted with KMS.

---

## Usage

Note: in this example, the vhost name is `/` which is `%2F` when encoded for the URL.

```
x-api-key: <apiKey>
POST /exchanges/%2F/myExchangeName/publish
{"properties":{},"routing_key":"my key","payload":"my body","payload_encoding":"string"}
```

---

## Deployment

Take care to use the correct AWS Credential "profile". By default, this service assumes you have the credentials set in `~/.aws/credentials` with the profile name equal to that environment's AWS Account Name (`staging`). If your profiles are named differently, be sure to use the `--profile` argument.

Note: Run these commands in the `serverless` directory

    serverless deploy --stage [stage|prod]

Specify profile override

    serverless deploy --stage stage --profile staging

## Logs

Logs are located in CloudWatch Logs. They can be viewed from your browser via the AWS Console:

* [`prefix=/aws/lambda/rabbitmq-message-proxy-*`](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logs:prefix=/aws/lambda/rabbitmq-message-proxy-)

You can interactively tail the logs for a given Lambda function by using the Serverless command line tools like so:

    serverless logs -f <function_name> -t

i.e.

    serverless logs -f publishMessage -t

---

## Development

Note: Run these commands in the `serverless` directory

Lambdas can be invoked locally as long as your local environment has AWS credentials with the required IAM roles and permissions. Invoke locally and optionally specify event data like so:

    serverless invoke local -f publishMessage -d '{"properties":{},"routing_key":"my key","payload":"my body","payload_encoding":"string"}'

For more advanced options when invoking locally, see the [Serverless Doc: Invoke Local](https://serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)

## API Keys

New clients need their own API Key. To generate a new API Key, add the client name to the `provider.apiKeys` config property in `serverless.yml` and deploy. The key will be in the output of the deploy command but only on the first deployment. Copy this value and add it to 1Password in addition to the client's secrets config.

### Secrets with KMS

On the initial deploy, you must first comment out the `awsKmsKeyArn` property in `serverless.yml`. Once the first deploy is finished, go to the [Encryption Keys section of the IAM Dashboard in the AWS Console](https://console.aws.amazon.com/iam/home?region=us-east-1#/encryptionKeys/us-east-1) and copy the ARN for the `rabbitmq-message-proxy-secrets`. Update the value of the `aws-kms-key-arn-secrets` property (with the copied ARN) in the appropriate config file (i.e. `config.stage.yml` for staging). Uncomment the `awsKmsKeyArn` property in `serverless.yml` and redeploy.

#### Add a new encrypted secret

The following command outputs the encrypted and base64-encoded string representation of the secret provided with the `--plaintext` option. Add the result to the function environment in `serverless.yml` and commit to source control.

    aws kms encrypt --key-id alias/rabbitmq-message-proxy-secrets --output text --query CiphertextBlob --plaintext 'mysecret'

Note: you must have the necessary IAM permission and be added to `resources.Resources.SecretsKMSKey.KeyPolicy.Statement[0].Principal.AWS` in `serverless.yml` (requires a deploy by existing user from that list).

---

## TODO

* Use a FIFO SQS queue, each client's messages can be processed as separate streams (using message group IDs) so one doesn't block the other
* Allow client to specify ES host... if auth is needed, it should be either added, encrypted, to the Serverless config or retrieved from some other AWS service
  * Rename the repo/resources so as to not be specific to "poi-serv"
* Allow client to specify API version if not already possible(?)
* Add stack output for the SQS queue name/arn/url
