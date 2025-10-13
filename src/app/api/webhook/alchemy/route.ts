import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

const PLATFORM_WALLET = process.env.PLATFORM_WALLET?.toLowerCase();
const TOLERANCE = 0.000001;

function isWldEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const activities = body.event?.activity || [];

    for (const tx of activities) {
      const { asset, fromAddress, toAddress, value, hash } = tx;

      console.log("✅ Transaksi terdeteksi:", tx);

      if (asset !== "WLD") continue;
      if (toAddress?.toLowerCase() !== PLATFORM_WALLET) continue;

      console.log("✅ Deposit WLD terdeteksi dari:", fromAddress);

      const q = query(
        collection(db, "transactions"),
        where("wldTransferStatus", "==", "pending"),
        where("transactionStatus", "==", "pending"),
        where("sourceAddress", "==", fromAddress.toLowerCase()),
        where("type", "==", "withdrawal")
      );

      const snapshot = await getDocs(q);

      let matched = false;

      for (const docSnap of snapshot.docs) {
        const txData = docSnap.data();
        const dbAmount = parseFloat(txData.wldAmount);
        const incomingValue = parseFloat(value);

        if (!isWldEqual(dbAmount, incomingValue)) continue;

        matched = true;

        await updateDoc(doc(db, "transactions", docSnap.id), {
          wldTransferStatus: "confirmed",
          confirmedAt: new Date().toISOString(),
          txHash: hash,
        });

        if (docSnap.id) {
          const messagesRef = collection(
            db,
            "transactions",
            docSnap.id,
            "messages"
          );
          await addDoc(messagesRef, {
            sender: "system",
            message: `📥 WLD kamu sudah kami terima! Transaksi sedang kami proses ke rekening tujuan. Terima kasih atas kepercayaanmu 🙌`,
            timestamp: serverTimestamp(),
            read: false,
          });
        }

        console.log(`🔹 Transaksi ${docSnap.id} dikonfirmasi`);

        const formattedAmount = txData.receivedAmount
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(txData.receivedAmount)
          : "-";

        await sendTelegramNotification(
          `💸 *Transaksi WLD Dikonfirmasi*\n\n` +
            `🔹 *ID Trx:* \`${docSnap.id || "-"}\`\n` +
            `🔹 *Dari:* \`${txData.sourceAddress || "-"}\`\n` +
            `🔹 *Jumlah:* ${value || "-"} WLD\n` +
            `🔹 *Status:* confirmed\n` +
            `🔹 *TxHash:* [${hash}](https://basescan.org/tx/${hash})\n\n` +
            `🏦 *Bank Tujuan*\n` +
            `• Nama Bank: ${txData.bankName || "-"}\n` +
            `• Provider: ${txData.bankProvider || "-"}\n` +
            `• No. Rekening: \`${txData.bankAccount || "-"}\`\n\n` +
            `• Harus Bayar : \`${formattedAmount || "-"}\`\n\n` +
            `${
              txData.proofUrl
                ? `📎 *Bukti:* [Lihat Bukti](${txData.proofUrl})`
                : ""
            }`
        );

        break;
      }

      if (!matched) {
        console.warn(
          "⚠️ Tidak ditemukan transaksi yang cocok berdasarkan value dan address"
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Alchemy Webhook Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function sendTelegramNotification(message: string) {
  try {
    const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.ADMIN_CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.warn("Token atau Chat ID tidak tersedia");
      return;
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    console.log("📤 Notifikasi Telegram dikirim");
  } catch (err) {
    console.error("Gagal kirim notifikasi Telegram:", err);
  }
}
