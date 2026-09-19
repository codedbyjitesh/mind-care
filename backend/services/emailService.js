const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (user && pass) {
    // If Gmail SMTP, using service: 'gmail' is standard and handles ports & SSL handshakes automatically
    if (host.includes('gmail') || user.includes('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: { rejectUnauthorized: false }
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: { rejectUnauthorized: false }
    });
  }

  // Null transporter fallback for offline development
  return null;
};

// Base HTML Wrapper for Mind Care Emails
const wrapEmailTemplate = (title, bodyHtml) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(13,148,136,0.3); }
        .link-box { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; word-break: break-all; font-size: 13px; color: #475569; margin-top: 16px; font-family: monospace; }
        .info-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #0369a1; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌸 MIND CARE</h1>
          <p>Student Mental Wellness Portal</p>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <p>© Mind Care – BSc IT Research Project.</p>
          <p>This is an automated system email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send Email Helper with race timeout (never hangs API requests)
const sendEmail = async ({ to, subject, html, fallbackLogMessage, urlForDev }) => {
  const transporter = createTransporter();
  const from = `Mind Care Portal <${process.env.EMAIL_USER || 'no-reply@mindcare.edu'}>`;

  if (transporter) {
    try {
      const sendPromise = transporter.sendMail({ from, to, subject, html });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP send timed out after 10 seconds')), 10000)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`[Email Service] Sent "${subject}" to ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`[Email Service Error] Failed to send email via SMTP:`, err.message);
      console.log(`[Email Service Dev Fallback] ${fallbackLogMessage}:`);
      console.log(`👉 Link: ${urlForDev}`);
      return null;
    }
  } else {
    console.log(`[Email Service Dev Mode] No SMTP config found. ${fallbackLogMessage}:`);
    console.log(`👉 Link: ${urlForDev}`);
    return null;
  }
};

// 1. Send Email Verification
const sendVerificationEmail = async (email, name, token, origin) => {
  const clientUrl = origin || process.env.CLIENT_URL || 'http://localhost:4200';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = wrapEmailTemplate(
    'Verify Email Address',
    `
      <div class="greeting">Welcome to Mind Care, ${name}! 👋</div>
      <p>Thank you for registering your student account. Please verify your email address to activate your mental wellness portal access.</p>
      
      <div class="btn-container">
        <a href="${verifyUrl}" target="_blank" class="btn">Verify Email Address</a>
      </div>

      <div class="info-box">
        ⏳ <strong>Expiration:</strong> This verification link will expire in 24 hours.
      </div>

      <p>Or copy and paste this URL into your web browser:</p>
      <div class="link-box">${verifyUrl}</div>

      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If you did not create a Mind Care account, please ignore this email.</p>
    `
  );

  return await sendEmail({
    to: email,
    subject: 'Mind Care – Verify Your Student Email Address',
    html,
    fallbackLogMessage: `EMAIL VERIFICATION LINK FOR ${email}`,
    urlForDev: verifyUrl
  });
};

// 2. Send Password Reset Email
const sendPasswordResetEmail = async (email, name, token, origin) => {
  const clientUrl = origin || process.env.CLIENT_URL || 'http://localhost:4200';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const html = wrapEmailTemplate(
    'Reset Password',
    `
      <div class="greeting">Hello, ${name}</div>
      <p>We received a request to reset the password for your Mind Care account.</p>

      <div class="btn-container">
        <a href="${resetUrl}" target="_blank" class="btn">Reset Your Password</a>
      </div>

      <div class="info-box">
        ⏳ <strong>Security Notice:</strong> This password reset link is valid for 30 minutes.
      </div>

      <p>Or copy and paste this URL into your web browser:</p>
      <div class="link-box">${resetUrl}</div>

      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If you did not request a password reset, please secure your account immediately or ignore this email.</p>
    `
  );

  return await sendEmail({
    to: email,
    subject: 'Mind Care – Password Reset Request',
    html,
    fallbackLogMessage: `PASSWORD RESET LINK FOR ${email}`,
    urlForDev: resetUrl
  });
};

// 3. Send Welcome Email (Post-verification)
const sendWelcomeEmail = async (email, name, origin) => {
  const clientUrl = origin || process.env.CLIENT_URL || 'http://localhost:4200';
  const dashboardUrl = `${clientUrl}/dashboard`;

  const html = wrapEmailTemplate(
    'Welcome to Mind Care',
    `
      <div class="greeting">Your Account is Verified, ${name}! 🎉</div>
      <p>Your Mind Care student account is now fully active. You have access to all self-care features designed for your academic balance:</p>
      
      <ul>
        <li><strong>Daily Mood Check-ins:</strong> Track emotional trends and identify study triggers.</li>
        <li><strong>Stress Assessments:</strong> Non-clinical student evaluations with personalized wellness recommendations.</li>
        <li><strong>Private Journal:</strong> Encrypted private journaling for daily reflection.</li>
        <li><strong>Guided Meditation & Breathing:</strong> Interactive 4-4-6 breathing timer for study breaks.</li>
      </ul>

      <div class="btn-container">
        <a href="${dashboardUrl}" target="_blank" class="btn">Go to Student Dashboard</a>
      </div>
    `
  );

  return await sendEmail({
    to: email,
    subject: 'Welcome to Mind Care – Student Mental Wellness Portal',
    html,
    fallbackLogMessage: `WELCOME EMAIL SENT TO ${email}`,
    urlForDev: dashboardUrl
  });
};

// 4. Send Wellness Reminder Email
const sendWellnessReminderEmail = async (email, name, reminderType = 'checkin') => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';

  const typeMessages = {
    mood: {
      title: 'Daily Mood Reflection',
      body: 'Take 30 seconds today to reflect on how you are feeling during your studies.',
      link: `${clientUrl}/mood`
    },
    journal: {
      title: 'Private Journal Prompt',
      body: 'Take a few quiet minutes to write your thoughts in your private journal.',
      link: `${clientUrl}/journal`
    },
    meditation: {
      title: 'Short Study Break & Breathing',
      body: 'Relax your mind with a 4-minute guided breathing exercise.',
      link: `${clientUrl}/meditation`
    }
  };

  const current = typeMessages[reminderType] || typeMessages.mood;

  const html = wrapEmailTemplate(
    current.title,
    `
      <div class="greeting">Hello, ${name} 🌿</div>
      <p>${current.body}</p>

      <div class="btn-container">
        <a href="${current.link}" target="_blank" class="btn">Open Mind Care</a>
      </div>

      <p style="margin-top: 20px; font-size: 12px; color: #64748b;">You can update your email notification preferences anytime in your Profile Settings.</p>
    `
  );

  return await sendEmail({
    to: email,
    subject: `Mind Care – ${current.title}`,
    html,
    fallbackLogMessage: `WELLNESS REMINDER SENT TO ${email}`,
    urlForDev: current.link
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendWellnessReminderEmail
};
