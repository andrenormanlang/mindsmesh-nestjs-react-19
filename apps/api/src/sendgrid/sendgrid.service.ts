import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendGridService {
  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendVerificationEmail(to: string, verificationLink: string): Promise<void> {
    const msg = {
      to,
      from: 'your_verified_sendgrid_email@example.com',
      subject: 'Email Verification',
      html: `
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to ${to}`);
    } catch (error) {
      console.error('Error sending verification email:', error.message);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    // Debugging logs
    console.log(`Preparing to send password reset email to: ${to}`);
    console.log(`Reset link: ${resetLink}`);

    const msg = {
      to,
      from: 'andrenormanlang@gmail.com', // Verified email address in SendGrid
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Password reset email sent to ${to}`);
    } catch (error) {
      // Provide detailed error information
      if (error.response) {
        console.error('Error response from SendGrid:', error.response.body.errors);
      } else {
        console.error('Error sending password reset email:', error.message);
      }
      throw new Error('Failed to send password reset email');
    }
  }
}
