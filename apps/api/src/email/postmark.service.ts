// src/email/postmark.service.ts
import { Injectable } from '@nestjs/common';
import * as postmark from 'postmark';

@Injectable()
export class PostmarkService {
  private client: postmark.ServerClient;

  constructor() {
    this.client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN); // Use the Postmark API token from the environment variables
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const email = {
      From: 'andrenormanlang@gmail.com', // Must be a verified sender email in Postmark
      To: to,
      Subject: 'Password Reset Request',
      HtmlBody: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    return this.client.sendEmail(email);
  }
}
