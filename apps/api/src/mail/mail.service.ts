import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    // Verify SMTP configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP configuration is incorrect:', error);
      } else {
        this.logger.log('SMTP server is ready to take our messages');
      }
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"MindsMesh" <andre.lang@medieinstitutet.se>`, // Use your verified sender address
      to,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password: ${resetLink}`,
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}

