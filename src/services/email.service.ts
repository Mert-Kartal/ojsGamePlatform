import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
      console.log("Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  static async sendWelcomeEmail(
    email: string,
    username: string,
    verificationToken: string
  ) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    const html = `
      <h1>Welcome to Our Game Platform!</h1>
      <p>Hi ${username},</p>
      <p>Thank you for joining our platform. We're excited to have you here!</p>
      <p>To verify your email address, please click the button below:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    return this.sendEmail(email, "Welcome to Our Game Platform!", html);
  }

  static async sendEmailVerification(
    email: string,
    username: string,
    verificationToken: string
  ) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    const html = `
      <h1>Email Verification</h1>
      <p>Hi ${username},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    return this.sendEmail(email, "Verify Your Email Address", html);
  }

  static async sendPasswordResetEmail(
    email: string,
    username: string,
    resetToken: string
  ) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
    `;

    return this.sendEmail(email, "Reset Your Password", html);
  }
}

export default EmailService;
