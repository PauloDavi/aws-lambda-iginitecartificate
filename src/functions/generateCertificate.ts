import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import chromium from "chrome-aws-lambda";
import { format } from "date-fns";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";

import { document } from "../utils/dynamodbClient";

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
}

interface ITemplate {
  id: string;
  name: string;
  grade: number;
  date: string;
  medal: string;
}

async function compile({ grade, ...data }: ITemplate) {
  const filePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "certificate.hbs"
  );

  const html = fs.readFileSync(filePath, "utf-8");

  return handlebars.compile(html)({ grade: grade.toFixed(2), ...data });
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { id, name, grade } = JSON.parse(
    event.body as string
  ) as ICreateCertificate;

  const response = await document
    .query({
      TableName: "users_certificates",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id,
      },
    })
    .promise();

  const userAlreadyExists = response.Items && response.Items[0];

  if (!userAlreadyExists) {
    await document
      .put({
        TableName: "users_certificates",
        Item: {
          id,
          name,
          grade,
        },
      })
      .promise();
  }

  const medalPath = path.join(process.cwd(), "src", "templates", "selo.png");

  const medal = fs.readFileSync(medalPath, "base64");

  const content = await compile({
    id,
    name,
    grade: Number(grade),
    date: format(new Date(), "dd/MM/yyyy"),
    medal,
  });

  const browser = await chromium.puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  });

  const page = await browser.newPage();

  await page.setContent(content);

  const pdf = await page.pdf({
    format: "a4",
    landscape: true,
    path: process.env.IS_OFFLINE ? "certificate.pdf" : undefined,
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  const s3 = new S3();

  await s3
    .putObject({
      Bucket: "ignitecertificatesbucket",
      Key: `${id}.pdf`,
      ACL: "public-read",
      Body: pdf,
      ContentType: "application/pdf",
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      url: `https://ignitecertificatesbucket.s3.sa-east-1.amazonaws.com/${id}.pdf`,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
