"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/use-userRole";
import { TransactionStatus, Message as MessageType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import TransactionDetails from "@/components/commons/TransactionDetail";
import { useRouter } from "next/navigation";
import MessageBubble from "@/components/commons/MessageBubble";

interface ChatMessage extends MessageType {
  id: string;
  timestamp: any | Date;
}

export default function ChatPage() {
  const params = useParams();
  const roomChatId = Array.isArray(params.roomChatId)
    ? params.roomChatId[0]
    : params.roomChatId;

  const { user, role, isLoading: isLoadingAuth } = useUserRole();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [wldTransferStatus, setWldTransferStatus] =
    useState<TransactionStatus>("pending");
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>("pending");
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [wldAmount, setWldAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [proofUrl, setProofUrl] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankProvider, setBankProvider] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = isLoadingAuth || isLoadingChat;
  const router = useRouter();

  useEffect(() => {
    if (!roomChatId || isLoadingAuth) return;

    const txnRef = doc(db, "transactions", roomChatId);

    const unsubscribeTxn = onSnapshot(txnRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setWldTransferStatus(
          (data.wldTransferStatus as TransactionStatus) || "pending"
        );
        setTransactionStatus(
          (data.transactionStatus as TransactionStatus) || "pending"
        );
        setWldAmount((data.wldAmount as number) || 0);
        setReceivedAmount((data.receivedAmount as number) || 0);
        setProofUrl((data.proofUrl as string) || "null");
        setBankName((data.bankName as string) || "null");
        setBankAccount((data.bankAccount as string) || "null");
        setBankProvider((data.bankProvider as string) || "null");
      }
    });

    const messagesRef = collection(db, "transactions", roomChatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<MessageType, "id"> & { timestamp: any };
        return {
          id: doc.id,
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          read: data.read,
        } as ChatMessage;
      });
      setMessages(msgs);
      setIsLoadingChat(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });

    return () => {
      unsubscribeTxn();
      unsubscribeMessages();
    };
  }, [roomChatId, isLoadingAuth]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomChatId || !role) return;

    const senderRole = role as "user" | "admin";

    try {
      const messagesRef = collection(
        db,
        "transactions",
        roomChatId,
        "messages"
      );
      await addDoc(messagesRef, {
        sender: senderRole,
        message: newMessage,
        timestamp: serverTimestamp(),
        read: false,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleEndTransaction = async () => {
    if (!roomChatId) return;

    const txnRef = doc(db, "transactions", roomChatId);

    try {
      await updateDoc(txnRef, {
        transactionStatus: "confirmed",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating transaction status:", err);
    }
  };

  if (!roomChatId)
    return (
      <div className="flex justify-center items-center min-h-screen bg-cyber-bg-primary p-6">
        <div className="text-center bg-cyber-bg-secondary p-6 rounded-lg shadow-lg shadow-cyan-500/10 max-w-md w-full">
          <h2 className="text-xl font-semibold text-cyber-text-primary">
            Room Tidak Ditemukan
          </h2>
          <p className="text-cyber-text-muted mt-2">
            Pastikan link yang Anda akses benar.
          </p>
        </div>
      </div>
    );

  if (isLoadingAuth)
    return (
      <div className="flex justify-center items-center min-h-screen bg-cyber-bg-primary p-6">
        <div className="text-center bg-cyber-bg-secondary p-6 rounded-lg shadow-lg shadow-cyan-500/10 max-w-md w-full">
          <h2 className="text-xl font-semibold text-cyber-text-primary">
            Memuat Data Pengguna...
          </h2>
          <p className="text-cyber-text-muted mt-2">
            Harap tunggu, kami sedang memuat data Anda.
          </p>
          <div className="mt-4">
            <div className="animate-spin border-t-4 border-cyber-accent-primary w-12 h-12 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-cyber-bg-primary p-6">
        <div className="text-center bg-cyber-bg-secondary p-6 rounded-lg shadow-lg shadow-cyan-500/10 max-w-md w-full">
          <h2 className="text-xl font-semibold text-cyber-text-primary">
            Anda Harus Login
          </h2>
          <p className="text-cyber-text-muted mt-2">
            Silakan login untuk mengakses chat.
          </p>
          <button className="mt-4 px-4 py-2 bg-cyber-accent-primary text-white rounded-lg hover:bg-cyber-accent-hover shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105">
            Login
          </button>
        </div>
      </div>
    );

  const isSender = (messageRole: string) => messageRole === role;

  return (
    <div className="min-h-screen bg-cyber-bg-primary flex flex-col">
      <header
        className={`bg-cyber-bg-secondary shadow p-4 grid ${
          user.role === "admin" ? "grid-cols-3" : "grid-cols-2"
        } items-center sticky top-0 z-10 border-b border-cyber-border-default`}
      >
        <div
          onClick={() => router.back()}
          className="cursor-pointer text-cyber-text-muted hover:text-cyber-text-primary flex items-center gap-2"
        >
          <ArrowLeft />
          <span>Back</span>
        </div>

        <div
          className={`flex flex-col space-y-2 justify-center ${
            user.role === "admin" ? "items-center" : "items-end"
          }`}
        >
          <Badge
            className={`${
              wldTransferStatus === "pending"
                ? "bg-cyber-accent-warning/20 text-cyber-accent-warning"
                : wldTransferStatus === "confirmed"
                ? "bg-cyber-accent-success/20 text-cyber-accent-success"
                : "bg-cyber-accent-danger/20 text-cyber-accent-danger"
            }`}
          >
            {wldTransferStatus === "pending"
              ? "Menunggu token sampai"
              : wldTransferStatus === "confirmed"
              ? "WLD berhasil diterima"
              : "Transaksi gagal, token tidak diterima."}
          </Badge>
          <Badge
            className={`${
              transactionStatus === "pending"
                ? "bg-cyber-accent-warning/20 text-cyber-accent-warning"
                : transactionStatus === "confirmed"
                ? "bg-cyber-accent-success/20 text-cyber-accent-success"
                : "bg-cyber-accent-danger/20 text-cyber-accent-danger"
            }`}
          >
            {transactionStatus === "pending"
              ? "Transaksi berlangsung"
              : transactionStatus === "confirmed"
              ? "Transaksi berhasil"
              : "Transaksi gagal, tidak ada penukaran."}
          </Badge>
        </div>

        {transactionStatus !== "confirmed" && user.role === "admin" && (
          <div className="flex justify-end">
            <ActionMenu
              wldTransferStatus={wldTransferStatus}
              handleEndTransaction={handleEndTransaction}
            />
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <p className="text-cyber-text-muted text-center">Memuat pesan...</p>
        ) : messages.length === 0 ? (
          <p className="text-cyber-text-muted text-center">Belum ada pesan</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              id={msg.id}
              sender={msg.sender}
              message={msg.message}
              timestamp={msg.timestamp}
              currentRole={role}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className={`p-4 pt-0 bg-cyber-bg-secondary flex flex-col gap-2 sticky bottom-0 z-10 border-t border-cyber-border-default`}
      >
        {transactionStatus === "confirmed" &&
          wldTransferStatus === "confirmed" && (
            <div className="absolute h-1/2 bottom-0 left-0 right-0 bg-cyber-accent-success/65 backdrop-blur-xs text-cyber-text-primary font-bold text-lg p-4 text-center cursor-not-allowed z-50">
              <span className="absolute bottom-6 left-0 right-0 text-cyber-accent-warning rounded-md font-extrabold">
                Transaksi Sudah Selesai
              </span>
            </div>
          )}
        <TransactionDetails
          wldAmount={wldAmount}
          receivedAmount={receivedAmount}
          bankName={bankName}
          bankProvider={bankProvider}
          bankAccount={bankAccount}
          proofUrl={proofUrl}
          showTransactionDetails={showTransactionDetails}
          setShowTransactionDetails={setShowTransactionDetails}
        />
        <div className="flex justify-center items-center">
          <Input
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            disabled={
              isLoading ||
              !role ||
              (transactionStatus === "confirmed" &&
                wldTransferStatus == "confirmed")
            }
            className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              isLoading ||
              !role ||
              (transactionStatus === "confirmed" &&
                wldTransferStatus == "confirmed")
            }
            className="bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const ActionMenu = ({ wldTransferStatus, handleEndTransaction }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="p-2 text-cyber-text-muted hover:text-cyber-text-primary cursor-pointer">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48 bg-cyber-bg-secondary border-cyber-border-default shadow-lg shadow-cyan-500/10">
      <DropdownMenuItem
        onClick={handleEndTransaction}
        disabled={wldTransferStatus === "failed"}
        className="text-sm text-cyber-text-primary focus:bg-cyber-bg-primary"
      >
        Selesaikan Transaksi
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
