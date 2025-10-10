import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/firestore";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mock transaction storage (in real app, use database)
let transactions: any[] = [
  {
    id: "tx_1",
    userId: "user_1",
    type: "withdrawal",
    wldAmount: 10,
    idrAmount: 285000,
    fee: 7125,
    status: "pending",
    timestamp: "2024-01-15T10:30:00Z",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  },
];

export const runtime = "nodejs"; // pastikan ini Node, bukan edge

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let filteredTransactions = transactions;

    if (userId) {
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.userId === userId
      );
    }

    if (status) {
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.status === status
      );
    }

    return NextResponse.json({
      success: true,
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const uid = formData.get("uid") as string;
    const wldAmount = parseFloat(formData.get("wldAmount") as string);
    const sourceAddress = formData.get("sourceAddress") as string;
    const bankAccount = formData.get("bankAccount") as string;
    const bankName = formData.get("bankName") as string;
    const proofFile = formData.get("proof") as File;

    if (!uid || !wldAmount || !bankAccount || !bankName || !proofFile) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // konversi File ke Buffer
    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // upload ke Cloudinary
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

    // hitung amount IDR
    const rate = parseFloat(formData.get("rate") as string) || 28500;
    const amount = wldAmount * rate;

    // simpan transaksi ke Firestore
    const txn = await createTransaction(uid, {
      type: "withdrawal",
      wldAmount,
      sourceAddress,
      amount,
      status: "pending",
      bankAccount,
      bankName,
      proofUrl: uploadResult.secure_url,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, id: txn.id });
  } catch (error) {
    console.error("Transaction API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("id");
    const { status } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["pending", "completed", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    const transactionIndex = transactions.findIndex(
      (tx) => tx.id === transactionId
    );
    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    transactions[transactionIndex].status = status;
    transactions[transactionIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      transaction: transactions[transactionIndex],
      message: `Transaction status updated to ${status}`,
    });
  } catch (error) {
    console.error("Transaction update error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
