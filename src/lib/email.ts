import nodemailer from 'nodemailer';

// These should be set in your Environment Variables on Hostinger/Vercel
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || 'sirajnurihrom@snishop.com';
const SMTP_PASS = process.env.SMTP_PASS || ''; // User needs to provide this
const FROM_EMAIL = process.env.FROM_EMAIL || 'sirajnurihrom@snishop.com';

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: `"LogFi" <${FROM_EMAIL}>`,
    to,
    subject: 'Verifikasi Akun LogFi Anda',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #0A0A0B; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.04em;">Log</span><span style="font-size: 28px; font-weight: 900; color: #8B5CF6; letter-spacing: -0.04em;">Fi</span>
        </div>
        <div style="background: #111113; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 30px;">
          <h2 style="color: #F4F4F5; text-align: center; font-weight: 900; margin: 0 0 10px;">Selamat Datang di LogFi!</h2>
          <p style="color: #A1A1AA; text-align: center; font-size: 14px;">Terima kasih telah mendaftar. Klik tombol di bawah untuk mengaktifkan akun Anda:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background: #8B5CF6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Verifikasi Email</a>
          </div>
          <p style="font-size: 11px; color: #52525B;">Jika tombol tidak berfungsi, salin link berikut:</p>
          <p style="font-size: 11px; color: #8B5CF6; word-break: break-all;">${verifyLink}</p>
        </div>
        <p style="font-size: 10px; color: #3F3F46; text-align: center; margin-top: 20px;">&copy; 2026 SNISHOP.ID &bull; LogFi Daily Assistant</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
