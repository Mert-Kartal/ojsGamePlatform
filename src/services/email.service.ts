import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
    debug: true, // Show debug output
    logger: true, // Log information in console
  });

  // Test function to diagnose SMTP issues
  static async testConnection() {
    console.log("\n=== SMTP Configuration ===");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("Secure:", false);
    console.log("User:", process.env.SMTP_USER);
    console.log("From Name:", process.env.SMTP_FROM_NAME);
    console.log("From Email:", process.env.SMTP_FROM_EMAIL);
    console.log("========================\n");

    try {
      console.log("Testing SMTP Connection...");
      const isConnected = await this.verifyConnection();
      console.log("Connection test result:", isConnected);

      if (isConnected) {
        console.log("Attempting to send test email...");
        const result = await this.sendEmailWithRetry(
          process.env.SMTP_USER!,
          "Test Email",
          "<h1>Test Email</h1><p>If you receive this, the email service is working correctly.</p>"
        );
        console.log("Test email result:", result);
      }
    } catch (error) {
      console.error("Test failed with error:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
  }

  private static async verifyConnection() {
    console.log("Verifying SMTP connection with following settings:");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    console.log("From Name:", process.env.SMTP_FROM_NAME);
    console.log("From Email:", process.env.SMTP_FROM_EMAIL);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP credentials are not configured");
      return false;
    }

    try {
      const verification = await this.transporter.verify();
      console.log("SMTP connection verified successfully:", verification);
      return true;
    } catch (error) {
      console.error(
        "SMTP connection verification failed. Detailed error:",
        error
      );
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
      }
      return false;
    }
  }

  private static async sendEmailWithRetry(
    to: string,
    subject: string,
    html: string,
    retries = 3
  ) {
    console.log("Attempting to send email to:", to);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Email sending attempt ${attempt}/${retries}`);

        if (!(await this.verifyConnection())) {
          console.error("SMTP connection verification failed");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        const mailOptions = {
          from: process.env.SMTP_FROM_EMAIL
            ? `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`
            : process.env.SMTP_USER,
          to,
          subject,
          html,
        };

        console.log("Sending email with options:", mailOptions);

        const info = await this.transporter.sendMail(mailOptions);

        console.log(`Email sent successfully on attempt ${attempt}. Details:`, {
          messageId: info.messageId,
          response: info.response,
          accepted: info.accepted,
          rejected: info.rejected,
        });

        return true;
      } catch (error) {
        console.error(
          `Error sending email (attempt ${attempt}/${retries}). Details:`,
          error
        );

        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }

        if (attempt === retries) {
          console.error("Max retries reached. Email sending failed.");
          return false;
        }

        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
    return false;
  }

  static async sendWelcomeEmail(
    email: string,
    username: string,
    verificationToken: string
  ) {
    if (!process.env.APP_URL) {
      console.error("APP_URL is not configured in environment variables");
      return false;
    }

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

    return this.sendEmailWithRetry(
      email,
      "Welcome to Our Game Platform!",
      html
    );
  }

  static async sendEmailVerification(
    email: string,
    username: string,
    verificationToken: string
  ) {
    if (!process.env.APP_URL) {
      console.error("APP_URL is not configured in environment variables");
      return false;
    }

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

    return this.sendEmailWithRetry(email, "Verify Your Email Address", html);
  }

  static async sendPasswordResetEmail(
    email: string,
    username: string,
    resetToken: string
  ) {
    if (!process.env.APP_URL) {
      console.error("APP_URL is not configured in environment variables");
      return false;
    }

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

    return this.sendEmailWithRetry(email, "Reset Your Password", html);
  }
}

export default EmailService;
