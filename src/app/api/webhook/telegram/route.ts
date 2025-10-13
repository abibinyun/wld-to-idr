import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ message: "No message to handle" });
    }

    const chatId = message.chat.id;
    const userText = message.text.trim();

    console.log("📨 Pesan dari Telegram:", userText);

    const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

    async function sendTelegramMessage(chatId: number | string, text: string) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      });
    }

    if (chatId.toString() === ADMIN_CHAT_ID) {
      const regex = /^confirm\s+(\S+)(?:\s+bukti\s+(https?:\/\/\S+))?/i;
      const match = userText.match(regex);
      if (match) {
        const transactionId = match[1];
        const proofUrl = match[2];

        try {
          const txDocRef = doc(db, "transactions", transactionId);
          const txSnap = await getDoc(txDocRef);

          if (!txSnap.exists()) {
            await sendTelegramMessage(
              chatId,
              `❌ Transaksi dengan ID ${transactionId} tidak ditemukan.`
            );
            return NextResponse.json({ success: false });
          }

          if (txSnap.id) {
            const messagesRef = collection(
              db,
              "transactions",
              transactionId,
              "messages"
            );
            await addDoc(messagesRef, {
              sender: "system",
              message: `🔔 Transaksi kamu sudah dikonfirmasi oleh admin.
              Proof URL: ${proofUrl}
              `,
              timestamp: serverTimestamp(),
              read: false,
            });
          }

          await updateDoc(txDocRef, {
            transactionStatus: "confirmed",
            proofUrl_admin: proofUrl,
            confirmedAt: new Date().toISOString(),
          });

          await sendTelegramMessage(
            chatId,
            `✅ Transaksi ${transactionId} sudah dikonfirmasi dan status diperbarui.`
          );

          if (txSnap.id) {
            await sendTelegramMessage(
              chatId,
              `💰 Transfer untuk transaksi ${transactionId} sudah selesai.\nTerima kasih!`
            );
          }

          return NextResponse.json({ success: true });
        } catch (error: any) {
          console.error("Gagal update transaksi:", error);
          await sendTelegramMessage(
            chatId,
            `❌ Gagal mengkonfirmasi transaksi: ${error.message || error}`
          );
          return NextResponse.json({ success: false });
        }
      }
    }

    let reply = `Kamu mengirim: ${userText}`;
    if (userText === "/start") {
      reply = "Selamat datang di bot kami! Kirim pesan lain untuk mencoba.";
    }

    await sendTelegramMessage(chatId, reply);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Telegram Webhook Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
