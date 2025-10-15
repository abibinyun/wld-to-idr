import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE,
} from "@/lib/emailTemplates";

// Konfigurasi transporter Nodemailer dengan Brevo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { email, username, actionType } = await req.json();

  if (!email || !actionType) {
    return NextResponse.json(
      { error: "Email dan actionType diperlukan." },
      { status: 400 }
    );
  }

  try {
    let actionLink: string;
    let subject: string;
    let htmlTemplate: string;

    // URL dasar untuk semua handler aksi kita
    const baseUrl = "https://cvwld.com/auth-action";

    // Tentukan tindakan berdasarkan actionType
    switch (actionType) {
      case "verifyEmail":
        if (!username) {
          return NextResponse.json(
            { error: "Username diperlukan untuk verifikasi email." },
            { status: 400 }
          );
        }
        actionLink = await auth.generateEmailVerificationLink(email, {
          url: `${baseUrl}?mode=verifyEmail`,
          handleCodeInApp: true,
        });
        subject = "Aktivasi Akun CVWLD Anda";
        htmlTemplate = VERIFICATION_EMAIL_TEMPLATE(username, actionLink);
        break;

      case "resetPassword":
        actionLink = await auth.generatePasswordResetLink(email, {
          url: `${baseUrl}?mode=resetPassword`,
          handleCodeInApp: true,
        });
        subject = "Reset Sandi CVWLD Anda";
        htmlTemplate = RESET_PASSWORD_EMAIL_TEMPLATE(
          username || "Pengguna",
          actionLink
        );
        break;

      default:
        return NextResponse.json(
          { error: "Tipe aksi tidak valid." },
          { status: 400 }
        );
    }

    // --- PERUBAHAN DI SINI: Kirim email menggunakan Nodemailer ---
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully for action: ${actionType}`);
    return NextResponse.json({
      success: true,
      message: "Email telah dikirim.",
    });
  } catch (err) {
    console.error("Error in auth email handler:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
