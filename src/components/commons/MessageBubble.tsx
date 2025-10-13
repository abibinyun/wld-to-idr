"use client";

import Image from "next/image";
import { isValidUrl } from "@/lib/utils";

interface MessageBubbleProps {
  id: string;
  sender: "user" | "admin" | "system";
  message: string;
  timestamp: Date | string;
  currentRole: "user" | "admin" | undefined;
}

export default function MessageBubble({
  id,
  sender,
  message,
  timestamp,
  currentRole,
}: MessageBubbleProps) {
  const isSystem = sender === "system";
  const isProofMessage = isSystem && message.includes("Proof URL:");

  let imageUrl: string | null = null;

  if (isProofMessage) {
    const match = message.match(/Proof URL:\s*(https?:\/\/\S+)/i);
    if (match && isValidUrl(match[1])) {
      imageUrl = match[1];
    }
  }

  const isSender = sender === currentRole;
  const isProofFromAdmin = isSystem && imageUrl && currentRole === "admin";
  const alignRight = isSender || isProofFromAdmin;

  const bubbleColorClass =
    isSender || isProofFromAdmin
      ? "bg-cyber-accent-primary text-white"
      : isSystem
      ? "bg-yellow-100 text-yellow-900"
      : "bg-cyber-bg-secondary text-cyber-text-primary";

  return (
    <div
      key={id}
      className={`p-3 rounded-lg max-w-xs break-words ${
        alignRight ? "ml-auto" : "mr-auto"
      } ${bubbleColorClass}`}
    >
      {imageUrl ? (
        <div className="space-y-2">
          <p className="font-medium">
            ✅ Transaksi berhasil. Dana telah kami transfer ke rekening tujuan.
            Silakan cek bukti transfer berikut. Terima kasih telah menggunakan
            layanan kami.
          </p>
          <Image
            src={imageUrl}
            alt="Bukti transfer"
            width={300}
            height={200}
            className="rounded-lg border border-gray-200 shadow"
          />
        </div>
      ) : (
        <p className="font-medium whitespace-pre-line">{message}</p>
      )}

      {/* Timestamp */}
      <span
        className={`text-xs block mt-1 ${
          alignRight ? "text-cyber-accent-primary/80" : "text-cyber-text-muted"
        }`}
      >
        {timestamp instanceof Date
          ? timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "..."}
      </span>
    </div>
  );
}
