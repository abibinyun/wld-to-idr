import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/firestore";
import { v2 as cloudinary } from "cloudinary";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const uid = formData.get("uid") as string;
    const wldAmount = parseFloat(formData.get("wldAmount") as string);
    const rate = parseFloat(formData.get("rate") as string);
    const sourceAddress = formData.get("sourceAddress") as string;
    const bankAccount = formData.get("bankAccount") as string;
    const bankName = formData.get("bankName") as string;
    const bankProvider = formData.get("bankProvider") as string;
    const proofFile = formData.get("proof") as File;

    if (!uid || !wldAmount || !bankAccount || !bankName || !proofFile) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "wld_proofs" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // parse ke desimal untuk dimasukan ke firebase
    const formattedAmount = Number(wldAmount.toFixed(8));

    const receivedAmount = parseFloat(
      (formattedAmount * rate - 10000).toFixed(2)
    );

    const txn = await createTransaction(uid, {
      type: "withdrawal",
      wldAmount: formattedAmount,
      sourceAddress,
      receivedAmount,
      rate,
      wldTransferStatus: "pending",
      transactionStatus: "pending",
      bankAccount,
      bankName,
      bankProvider,
      proofUrl: uploadResult.secure_url,
      created_at: new Date(),
    });

    if (txn.id) {
      const messagesRef = collection(db, "transactions", txn.id, "messages");
      await addDoc(messagesRef, {
        sender: "system",
        message: `⏳ Terima kasih! Transaksi kamu telah kami terima dan sedang menunggu konfirmasi dari jaringan. Kami akan memprosesnya segera setelah WLD masuk ke wallet kami.`,
        timestamp: serverTimestamp(),
        read: false,
      });
    }

    return NextResponse.json({ success: true, id: txn.id });
  } catch (error) {
    console.error("Transaction API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
