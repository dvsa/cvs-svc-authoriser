# cvs-svc-authoriser
Custom authentication and authorisation mechanism for all CVS API Gateway calls.

* Calls to CVS APIG trigger Lambda handler [authorizer.ts][authorizer-ts], as described on [AWS Lambda Authorizer Input][lambda-authorizer-input].
* This Lambda will return a policy document, as described on [AWS Lambda Authorizer Input][lambda-authorizer-input].

## Documentation
See the [Lambda Authorizer Confluence page][confluence].

## Configuration
* Configuration is in YML format.
* It's stored under AWS Secrets Manager, under path `<environment>/auth/config.yml`.
* A (fake) example can be found [here][fake-config].
## Prerequisites
### Node JS
Check you have Node and NPM in your terminal:
```shell script
node --version
npm --version
```

**We strongly recommend [`nvm`][nvm] to manage your Node installation.**

To install on Linux:
```shell script
sudo apt install nodejs
```

To install on Windows, either:
* Download from [official site][nodejs]
* Use [Chocolatey][chocolatey]: `cinst nodejs.install`

## Dependencies
```shell script
npm install
```

## Build
```shell script
npm run build
```

Output folder: `build/` (Git-ignored)

On Windows, you will need to use [Git Bash][git-bash]. You may also need to:
* replace `export` statements with your own environment variable configuration.
* find binaries for things like `cpio`.

## Test
```shell script
npm test
```

This project only contains unit tests. For integration tests, see [cvs-svc-auto][cvs-svc-auto].

## Run
This Lambda is an authorizer and shouldn't be directly executed.

For debugging purposes, available choices are:
   * Call the Lambda manually (it's not exposed directly via APIG) with [the right input][lambda-authorizer-input].
   * Protect something with the authorizer (e.g. an existing non-prod endpoint) and call it.

[confluence]: https://wiki.dvsacloud.uk/display/HVT/Lambda+Authoriser
[nvm]: https://github.com/nvm-sh/nvm
[nodejs]: https://nodejs.org
[chocolatey]: https://chocolatey.org
[git-bash]: https://git-scm.com/downloads
[cvs-svc-auto]: https://github.com/dvsa/cvs-auto-svc
[authorizer-ts]: https://github.com/dvsa/cvs-svc-authoriser/blob/develop/src/functions/authorizer.ts
[fake-config]: https://github.com/dvsa/cvs-svc-authoriser/blob/develop/tests/resources/config-test.yml
[lambda-authorizer-input]: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
[lambda-authorizer-output]: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html