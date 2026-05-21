import { env } from "@graphora/env/server";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: env.EMAIL_API_KEY,
});

export async function sendEmail(email: string, url: string) {
  const sentFrom = new Sender(env.EMAIL_USER);

  const personalization = [
    {
      email: email,
      data: {
        url,
      },
    },
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo([new Recipient(email)])
    .setReplyTo(sentFrom)
    .setSubject("Verify your Graphora Account")
    .setTemplateId(env.EMAIL_VERIFICATION_TEMPLATE_ID)
    .setPersonalization(personalization);

  const res = await mailerSend.email.send(emailParams);
  console.log(
    `--------------- Sending email to "${email}" the status: ${res.statusCode} ---------------`,
  );
}