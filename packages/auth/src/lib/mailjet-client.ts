import { env } from "@graphora/env/server";
import { Client, SendEmailV3_1 } from "node-mailjet";

const mailjet = new Client({
  apiKey: env.EMAIL_API_KEY,
  apiSecret: env.EMAIL_SECRET_KEY,
});

export async function sendEmail(email: string, url: string) {
  const data: SendEmailV3_1.Body = {
    Messages: [
      {
        From: {
          Email: "mahmoud.ahmed.25.9.24@gmail.com",
        },
        To: [
          {
            Email: email,
          },
        ],
        TemplateID: parseInt(env.EMAIL_VERIFICATION_TEMPLATE_ID),
        Variables: {
          verification_url: url,
        },
      },
    ],
  };

  const response = await mailjet
    .post("send", { version: "v3.1" })
    .request(data);
  console.log(
    `\n\n----------------\n\n\nSending email to: ${email} - Status: ${response.response.status}\n\n----------------\n\n\n`,
  );
}
