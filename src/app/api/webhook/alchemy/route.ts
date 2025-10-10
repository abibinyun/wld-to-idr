// import { NextRequest, NextResponse } from 'next/server';

// // Webhook signature verification (simplified)
// function verifyWebhookSignature(payload: string, signature: string): boolean {
//   // In real app, implement proper signature verification
//   // using Alchemy's signing secret
//   return true;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const signature = request.headers.get('x-alchemy-signature');
//     const payload = await request.text();

//     // Verify webhook signature
//     if (!signature || !verifyWebhookSignature(payload, signature)) {
//       return NextResponse.json(
//         { error: 'Invalid signature' },
//         { status: 401 }
//       );
//     }

//     const webhookData = JSON.parse(payload);

//     console.log('Received Alchemy webhook:', webhookData);

//     // Process different webhook types
//     switch (webhookData.type) {
//       case 'MINED_TRANSACTION':
//         await handleMinedTransaction(webhookData.data);
//         break;

//       case 'DROPPED_TRANSACTION':
//         await handleDroppedTransaction(webhookData.data);
//         break;

//       case 'ADDRESS_ACTIVITY':
//         await handleAddressActivity(webhookData.data);
//         break;

//       default:
//         console.log('Unknown webhook type:', webhookData.type);
//     }

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error('Webhook processing error:', error);
//     return NextResponse.json(
//       { error: 'Webhook processing failed' },
//       { status: 500 }
//     );
//   }
// }

// async function handleMinedTransaction(data: any) {
//   console.log('Transaction mined:', data.transaction.hash);

//   // In real app:
//   // 1. Find pending transaction by tx hash
//   // 2. Verify amount and recipient
//   // 3. Update transaction status to completed
//   // 4. Process IDR payout to user's bank account
//   // 5. Send confirmation notification

//   // Mock processing
//   const txHash = data.transaction.hash;
//   const fromAddress = data.transaction.from;
//   const toAddress = data.transaction.to;
//   const value = data.transaction.value; // in wei

//   console.log(`Processing WLD transfer from ${fromAddress} to ${toAddress}, value: ${value}`);
// }

// async function handleDroppedTransaction(data: any) {
//   console.log('Transaction dropped:', data.transaction.hash);

//   // In real app:
//   // 1. Find the corresponding pending transaction
//   // 2. Update status to failed
//   // 3. Notify user about the failed transaction
//   // 4. Provide guidance for retry
// }

// async function handleAddressActivity(data: any) {
//   console.log('Address activity detected:', data.activity);

//   // In real app:
//   // 1. Check if activity is related to our monitored addresses
//   // 2. Process incoming WLD transfers
//   // 3. Update user balances
//   // 4. Trigger conversion process if auto-convert is enabled
// }

// // Webhook configuration endpoint
// export async function GET() {
//   return NextResponse.json({
//     webhook: {
//       url: '/api/webhook/alchemy',
//       events: [
//         'MINED_TRANSACTION',
//         'DROPPED_TRANSACTION',
//         'ADDRESS_ACTIVITY'
//       ],
//       status: 'active'
//     }
//   });
// }

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const PLATFORM_WALLET =
  "0x1234567890abcdef1234567890abcdef12345678".toLowerCase();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const activities = body.event?.activity || [];

    for (const tx of activities) {
      const { asset, fromAddress, toAddress, value, hash } = tx;

      if (asset !== "WLD") continue;
      if (toAddress?.toLowerCase() !== PLATFORM_WALLET) continue;

      console.log("✅ Deposit WLD terdeteksi dari:", fromAddress);

      // Cari transaksi user yang masih "waiting_deposit"
      const q = query(
        collection(db, "transactions"),
        where("status", "==", "waiting_deposit"),
        where("uid", "==", fromAddress.toLowerCase()) // pastikan user simpan wallet di profile
      );

      const snapshot = await getDocs(q);

      snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, "transactions", docSnap.id), {
          status: "confirmed",
          confirmedAt: new Date().toISOString(),
          txHash: hash,
          receivedAmount: value,
        });
        console.log(`🔹 Transaksi ${docSnap.id} dikonfirmasi`);
      });
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
