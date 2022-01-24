# Sistema de geração de certificados - AWS Serverless Node.js Typescript

Esse projeto utiliza funções serverless para gerar e verificar certificados, utilizando dynamodb para guardar as informações e S3 para salvar o certificado
Esse projeto é baseado no template `aws-nodejs-typescript` que utiliza o framework [Serverless](https://www.serverless.com/).
A [documentação](https://www.serverless.com/framework/docs/providers/aws/).

## Como utilizar

- Execute `yarn` para instalar as dependências
- Execute `sls dynamodb install` para instalar o banco em memoria local
- Execute `yarn dynamodb:start` para iniciar o banco em memoria local
- Após isso execute `yarn dev` para executar offline
- Para fazer o deploy, uma vez com a cli configurada execute `yarn deploy` para fazer o deploy

## Rotas

- `/generate-certificate` - Gera o certificado a partir de um id, nome e uma nota e retorna a url do certificado gerado
- `/verify-certificate/{id}` - Valida um certificado a partir de um id e retorna e url caso o certificado seja válido

## Estrutura do projeto

O projeto tem uma estrutura simples dentro da pasta `src`:

- `functions` - contém todas as funções lambda
- `templates` - contém o template handlebars do certificado
- `utils` - contém funções uteis para o projeto

```
.
├── src
│   ├── functions
│   │   ├── generateCertificate
│   │   └── verifyCertificate.ts
|   |
│   ├── templates
│   │   └── certificate.hbs
│   │
│   └── utils
│       └── dynamodbClient.ts
│
├── package.json
├── serverless.yml
├── tsconfig.json
├── .babelrc
├── .eslintignore
├── .eslintrc.json
├── tsconfig.json
└── webpack.config.js
```
