// lib/emailTemplates.js

/**
 * Palet Warna Tema Cyber CVWLD
 * - bg-primary: #0a0a0a (Latar belakang utama yang sangat gelap)
 * - bg-secondary: #1a1a1a (Latar untuk kartu/kontainer)
 * - text-primary: #f1f5f9 (Teks utama terang)
 * - text-muted: #94a3b8 (Teks sekunder yang lebih redup)
 * - accent-primary: #22d3ee (Aksen cyan terang untuk CTA dan highlight)
 * - accent-success: #10b981 (Hijau untuk status sukses)
 * - accent-danger: #ef4444 (Merah untuk status error)
 * - border-default: #374151 (Warna border untuk input dan kartu)
 */

/**
 * Template untuk verifikasi email pengguna baru.
 * @param {string} userName - Nama pengguna.
 * @param {string} verificationLink - Tautan verifikasi akun.
 */
export const VERIFICATION_EMAIL_TEMPLATE = (userName, verificationLink) => `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Aktivasi Akun CVWLD</title>
    <style>
      body {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        background-color: #0a0a0a;
        padding: 0;
        margin: 0;
        color: #f1f5f9;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #374151;
        box-shadow: 0 0 20px rgba(34, 211, 238, 0.1);
      }
      .header {
        background-color: #22d3ee;
        padding: 24px;
        text-align: center;
        color: #0a0a0a;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        padding: 32px 24px;
        color: #f1f5f9;
      }
      .content p {
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .btn {
        display: inline-block;
        padding: 12px 20px;
        background-color: #22d3ee;
        color: #0a0a0a !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 16px;
        box-shadow: 0 0 15px rgba(34, 211, 238, 0.5);
        transition: all 0.3s ease;
      }
      .btn:hover {
        transform: scale(1.05);
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #94a3b8;
        border-top: 1px solid #374151;
      }
      @media only screen and (max-width: 600px) {
        .content { padding: 24px 16px; }
        .header h1 { font-size: 18px; }
        .btn { padding: 10px 16px; font-size: 14px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Aktivasi Akun CVWLD Anda</h1>
      </div>
      <div class="content">
        <p>Halo, ${userName}!</p>
        <p>
          Selamat bergabung dengan <strong>CVWLD</strong>, platform terpercaya untuk konversi Worldcoin ke Rupiah.
        </p>
        <p>
          Untuk mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:
        </p>
        <div style="text-align: center;">
          <a href="${verificationLink}" class="btn">Verifikasi Email Sekarang</a>
        </div>
        <p style="margin-top: 24px;">
          Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini. Tautan ini akan kedaluwarsa dalam 24 jam.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 CVWLD. Semua Hak Dilindungi.
      </div>
    </div>
  </body>
</html>
`;

/**
 * Template untuk reset password.
 * @param {string} userName - Nama pengguna.
 * @param {string} resetLink - Tautan untuk mereset password.
 */
export const RESET_PASSWORD_EMAIL_TEMPLATE = (userName, resetLink) => `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Sandi CVWLD</title>
    <style>
      body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #0a0a0a; padding: 0; margin: 0; color: #f1f5f9; }
      .container { max-width: 600px; margin: 40px auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid #374151; box-shadow: 0 0 20px rgba(34, 211, 238, 0.1); }
      .header { background-color: #22d3ee; padding: 24px; text-align: center; color: #0a0a0a; }
      .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
      .content { padding: 32px 24px; color: #f1f5f9; }
      .content p { line-height: 1.6; margin-bottom: 16px; }
      .btn { display: inline-block; padding: 12px 20px; background-color: #22d3ee; color: #0a0a0a !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.5); transition: all 0.3s ease; }
      .btn:hover { transform: scale(1.05); }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #374151; }
      @media only screen and (max-width: 600px) { .content { padding: 24px 16px; } .header h1 { font-size: 18px; } .btn { padding: 10px 16px; font-size: 14px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Permintaan Reset Sandi</h1>
      </div>
      <div class="content">
        <p>Halo, ${userName}!</p>
        <p>
          Kami menerima permintaan untuk mereset sandi akun CVWLD Anda. Jika ini adalah Anda, silakan klik tombol di bawah untuk membuat sandi baru:
        </p>
        <div style="text-align: center;">
          <a href="${resetLink}" class="btn">Reset Sandi Saya</a>
        </div>
        <p style="margin-top: 24px;">
          Jika Anda tidak meminta reset sandi, abaikan email ini. Untuk keamanan, tautan ini akan kedaluwarsa dalam 1 jam.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 CVWLD. Semua Hak Dilindungi.
      </div>
    </div>
  </body>
</html>
`;

/**
 * Template untuk konfirmasi transaksi yang baru diajukan.
 * @param {string} userName - Nama pengguna.
 * @param {string} transactionId - ID unik transaksi.
 * @param {string} wldAmount - Jumlah WLD yang dikonversi.
 * @param {string} estimatedIdr - Estimasi jumlah Rupiah yang diterima.
 * @param {string} walletAddress - Alamat wallet tujuan transfer.
 */
export const TRANSACTION_CONFIRMATION_EMAIL_TEMPLATE = (
  userName,
  transactionId,
  wldAmount,
  estimatedIdr,
  walletAddress
) => `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Transaksi CVWLD Sedang Diproses</title>
    <style>
      body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #0a0a0a; padding: 0; margin: 0; color: #f1f5f9; }
      .container { max-width: 600px; margin: 40px auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid #374151; box-shadow: 0 0 20px rgba(34, 211, 238, 0.1); }
      .header { background-color: #22d3ee; padding: 24px; text-align: center; color: #0a0a0a; }
      .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
      .content { padding: 32px 24px; color: #f1f5f9; }
      .content p { line-height: 1.6; margin-bottom: 16px; }
      .btn { display: inline-block; padding: 12px 20px; background-color: #22d3ee; color: #0a0a0a !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.5); transition: all 0.3s ease; }
      .btn:hover { transform: scale(1.05); }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #374151; }
      .transaction-details { background-color: #0a0a0a; border-left: 4px solid #22d3ee; padding: 16px; margin: 20px 0; border-radius: 4px; }
      .transaction-details p { margin: 4px 0; }
      @media only screen and (max-width: 600px) { .content { padding: 24px 16px; } .header h1 { font-size: 18px; } .btn { padding: 10px 16px; font-size: 14px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Transaksi Sedang Diproses</h1>
      </div>
      <div class="content">
        <p>Halo, ${userName}!</p>
        <p>
          Terima kasih telah menggunakan layanan <strong>CVWLD</strong>. Transaksi Anda telah kami terima dan sedang dalam proses verifikasi.
        </p>
        
        <div class="transaction-details">
          <p><strong>ID Transaksi:</strong> #${transactionId}</p>
          <p><strong>Jumlah WLD:</strong> ${wldAmount} WLD</p>
          <p><strong>Estimasi Rupiah:</strong> Rp ${estimatedIdr}</p>
          <p><strong>Transfer ke:</strong> ${walletAddress}</p>
        </div>

        <p>
          Silakan lanjutkan dengan mengirimkan jumlah WLD yang tepat ke alamat wallet yang tertera. Setelah kami verifikasi, dana akan segera kami transfer ke rekening Anda.
        </p>
        <p>
          Pantau status transaksi Anda secara real-time di dashboard.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 CVWLD. Semua Hak Dilindungi.
      </div>
    </div>
  </body>
</html>
`;

/**
 * Template untuk notifikasi transaksi yang berhasil diselesaikan.
 * @param {string} userName - Nama pengguna.
 * @param {string} transactionId - ID unik transaksi.
 * @param {string} wldAmount - Jumlah WLD yang dikonversi.
 * @param {string} finalIdr - Jumlah Rupiah akhir yang diterima.
 * @param {string} bankName - Nama bank tujuan.
 * @param {string} accountNumber - Nomor rekening tujuan.
 */
export const TRANSACTION_SUCCESS_EMAIL_TEMPLATE = (
  userName,
  transactionId,
  wldAmount,
  finalIdr,
  bankName,
  accountNumber
) => `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Transaksi CVWLD Berhasil!</title>
    <style>
      body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #0a0a0a; padding: 0; margin: 0; color: #f1f5f9; }
      .container { max-width: 600px; margin: 40px auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid #374151; box-shadow: 0 0 20px rgba(34, 211, 238, 0.1); }
      .header { background-color: #22d3ee; padding: 24px; text-align: center; color: #0a0a0a; }
      .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
      .content { padding: 32px 24px; color: #f1f5f9; }
      .content p { line-height: 1.6; margin-bottom: 16px; }
      .btn { display: inline-block; padding: 12px 20px; background-color: #22d3ee; color: #0a0a0a !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.5); transition: all 0.3s ease; }
      .btn:hover { transform: scale(1.05); }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #374151; }
      .success-box { background-color: #064e3b; border: 1px solid #10b981; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0; }
      .success-box p { margin: 0; color: #10b981; font-weight: bold; }
      .transaction-details { background-color: #0a0a0a; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px; }
      .transaction-details p { margin: 4px 0; }
      @media only screen and (max-width: 600px) { .content { padding: 24px 16px; } .header h1 { font-size: 18px; } .btn { padding: 10px 16px; font-size: 14px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Transaksi Berhasil!</h1>
      </div>
      <div class="content">
        <p>Halo, ${userName}!</p>
        <p>
          Kami senang menginformasikan bahwa transaksi Anda telah berhasil diproses. Dana telah dikirim ke rekening Anda.
        </p>
        
        <div class="success-box">
          <p>✅ Transaksi Selesai</p>
        </div>

        <div class="transaction-details">
          <p><strong>ID Transaksi:</strong> #${transactionId}</p>
          <p><strong>Jumlah WLD:</strong> ${wldAmount} WLD</p>
          <p><strong>Total Diterima:</strong> Rp ${finalIdr}</p>
          <p><strong>Bank Tujuan:</strong> ${bankName}</p>
          <p><strong>No. Rekening:</strong> ${accountNumber}</p>
        </div>

        <p>
          Terima kasih telah mempercayai <strong>CVWLD</strong>. Kami tunggu transaksi Anda selanjutnya!
        </p>
      </div>
      <div class="footer">
        &copy; 2025 CVWLD. Semua Hak Dilindungi.
      </div>
    </div>
  </body>
</html>
`;
