// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams } from "next/navigation";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   doc,
//   getDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight } from "lucide-react";

// interface Message {
//   id: string;
//   senderId: string;
//   content: string;
//   timestamp: Date;
// }

// export default function ChatPage() {
//   const params = useParams();
//   const roomChatId = Array.isArray(params.roomChatId)
//     ? params.roomChatId[0]
//     : params.roomChatId;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [status, setStatus] = useState<"pending" | "completed" | "failed">(
//     "pending"
//   );
//   const [loading, setLoading] = useState(true);

//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!roomChatId) return;

//     // listen roomChat status
//     const roomRef = doc(db, "roomChats", roomChatId);
//     const unsubscribeRoom = onSnapshot(roomRef, (snap) => {
//       if (snap.exists()) {
//         const data = snap.data();
//         setStatus(data.status || "pending");
//       }
//     });

//     // listen messages
//     const messagesRef = collection(db, "roomChats", roomChatId, "messages");
//     const q = query(messagesRef, orderBy("timestamp", "asc"));
//     const unsubscribeMessages = onSnapshot(q, (snapshot) => {
//       setMessages(
//         snapshot.docs.map((doc) => {
//           const data = doc.data() as Omit<Message, "id">;
//           return { id: doc.id, ...data };
//         })
//       );
//       // scroll to bottom
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//       setLoading(false);
//     });

//     return () => {
//       unsubscribeRoom();
//       unsubscribeMessages();
//     };
//   }, [roomChatId]);

//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !roomChatId) return;
//     try {
//       const messagesRef = collection(db, "roomChats", roomChatId, "messages");
//       await addDoc(messagesRef, {
//         senderId: "user", // bisa diganti dengan uid user
//         content: newMessage,
//         timestamp: serverTimestamp(),
//       });
//       setNewMessage("");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (!roomChatId) return <div>Room tidak ditemukan</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       {/* Header */}
//       <header className="bg-white shadow p-4 flex justify-between items-center">
//         <h1 className="font-bold text-lg">Chat Transaksi</h1>
//         <Badge
//           variant={
//             status === "completed"
//               ? "default"
//               : status === "pending"
//               ? "secondary"
//               : "destructive"
//           }
//         >
//           {status === "completed"
//             ? "Selesai"
//             : status === "pending"
//             ? "Pending"
//             : "Gagal"}
//         </Badge>
//       </header>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {loading ? (
//           <p className="text-gray-500 text-center">Memuat pesan...</p>
//         ) : messages.length === 0 ? (
//           <p className="text-gray-500 text-center">Belum ada pesan</p>
//         ) : (
//           messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`p-2 rounded-md max-w-xs ${
//                 msg.senderId === "user"
//                   ? "bg-blue-100 ml-auto"
//                   : "bg-gray-200 mr-auto"
//               }`}
//             >
//               <p>{msg.content}</p>
//               <span className="text-xs text-gray-400">
//                 {msg.timestamp instanceof Date
//                   ? msg.timestamp.toLocaleTimeString()
//                   : ""}
//               </span>
//             </div>
//           ))
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* Input */}
//       <div className="p-4 bg-white flex gap-2 border-t">
//         <Input
//           placeholder="Ketik pesan..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") handleSendMessage();
//           }}
//         />
//         <Button onClick={handleSendMessage}>
//           <ArrowRight className="w-4 h-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// ============================
// ############################
// ============================

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams } from "next/navigation";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   doc,
//   getDoc,
//   serverTimestamp,
//   Timestamp,
//   DocumentData,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight } from "lucide-react";
// import { useUserRole } from "@/hooks/use-userRole";

// interface Message {
//   id: string;
//   senderId: string;
//   role: string;
//   content: string;
//   timestamp: Date;
// }

// export default function ChatPage() {
//   const params = useParams();
//   const roomChatId = Array.isArray(params.roomChatId)
//     ? params.roomChatId[0]
//     : params.roomChatId;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [status, setStatus] = useState<"pending" | "completed" | "failed">(
//     "pending"
//   );
//   const [loading, setLoading] = useState(true);
//   const [currentRole, setCurrentRole] = useState<"user" | "admin">("user");
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const { role } = useUserRole();

//   useEffect(() => {
//     console.log("Auth Role: ", role);
//   }, []);

//   // const getUserRole = async (userId: string): Promise<"user" | "admin"> => {
//   //   try {
//   //     const userDoc = await getDoc(doc(db, "users", userId));
//   //     if (userDoc.exists()) {
//   //       const data = userDoc.data();
//   //       return (data.role as "user" | "admin") || "user";
//   //     }
//   //     return "user";
//   //   } catch (err) {
//   //     console.error(err);
//   //     return "user";
//   //   }
//   // };

//   useEffect(() => {
//     if (!roomChatId) return;

//     // // Ambil role current user dari roomChat / userId tertentu
//     // const fetchCurrentUserRole = async () => {
//     //   try {
//     //     // Misal kita pakai roomChatId untuk lookup current user uid
//     //     const roomDoc = await getDoc(doc(db, "roomChats", roomChatId));
//     //     if (roomDoc.exists()) {
//     //       const roomData = roomDoc.data() as DocumentData;
//     //       const userId = roomData.userId || "defaultUserId";
//     //       const role = await getUserRole(userId);

//     //       setCurrentRole(role);
//     //     }
//     //   } catch (err) {
//     //     console.error(err);
//     //   }
//     // };
//     // fetchCurrentUserRole();

//     // listen roomChat status
//     const roomRef = doc(db, "roomChats", roomChatId);
//     const unsubscribeRoom = onSnapshot(roomRef, (snap) => {
//       if (snap.exists()) {
//         const data = snap.data() as DocumentData;
//         setStatus(data.status || "pending");
//       }
//     });

//     // listen messages
//     const messagesRef = collection(db, "roomChats", roomChatId, "messages");
//     const q = query(messagesRef, orderBy("timestamp", "asc"));
//     const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
//       const msgs: Message[] = await Promise.all(
//         snapshot.docs.map(async (doc) => {
//           const data = doc.data() as Omit<Message, "id" | "role"> & {
//             timestamp: Timestamp | null;
//           };
//           // const role = await getUserRole(data.senderId);
//           return {
//             id: doc.id,
//             senderId: data.senderId,
//             role,
//             content: data.content,
//             timestamp: data.timestamp
//               ? (data.timestamp as Timestamp).toDate()
//               : new Date(),
//           };
//         })
//       );
//       setMessages(msgs);
//       setLoading(false);
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     });

//     return () => {
//       unsubscribeRoom();
//       unsubscribeMessages();
//     };
//   }, [roomChatId]);

//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !roomChatId) return;
//     try {
//       const messagesRef = collection(db, "roomChats", roomChatId, "messages");
//       await addDoc(messagesRef, {
//         senderId: role, // role current user
//         content: newMessage,
//         timestamp: serverTimestamp(),
//       });
//       setNewMessage("");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (!roomChatId) return <div>Room tidak ditemukan</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       {/* Header */}
//       <header className="bg-white shadow p-4 flex justify-between items-center">
//         <h1 className="font-bold text-lg">Chat Transaksi</h1>
//         <Badge
//           variant={
//             status === "completed"
//               ? "default"
//               : status === "pending"
//               ? "secondary"
//               : "destructive"
//           }
//         >
//           {status === "completed"
//             ? "Selesai"
//             : status === "pending"
//             ? "Pending"
//             : "Gagal"}
//         </Badge>
//       </header>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {loading ? (
//           <p className="text-gray-500 text-center">Memuat pesan...</p>
//         ) : messages.length === 0 ? (
//           <p className="text-gray-500 text-center">Belum ada pesan</p>
//         ) : (
//           messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`p-2 rounded-md max-w-xs break-words ${
//                 msg.role === "user"
//                   ? "bg-blue-100 ml-auto text-right"
//                   : "bg-gray-200 mr-auto text-left"
//               }`}
//             >
//               <p>{msg.content}</p>
//               <span className="text-xs text-gray-400">
//                 {msg.timestamp.toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </span>
//             </div>
//           ))
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* Input */}
//       <div className="p-4 bg-white flex gap-2 border-t">
//         <Input
//           placeholder="Ketik pesan..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") handleSendMessage();
//           }}
//         />
//         <Button onClick={handleSendMessage}>
//           <ArrowRight className="w-4 h-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// ================================
// ################################
// ================================

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
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useUserRole } from "@/hooks/use-userRole"; // 💡 Pastikan path dan nama file hook sudah benar
import { TransactionStatus, Message as MessageType } from "@/types"; // Import tipe dari /types/index.ts

// Tipe untuk data pesan yang diterima dari Firestore
interface ChatMessage extends MessageType {
  id: string;
  timestamp: Timestamp | Date; // Bisa berupa Timestamp (sebelum convert) atau Date (setelah convert)
}

export default function ChatPage() {
  const params = useParams();
  const roomChatId = Array.isArray(params.roomChatId)
    ? params.roomChatId[0]
    : params.roomChatId;

  // Mengambil user, role, dan loading status dari custom hook
  const { user, role, isLoading: isLoadingAuth } = useUserRole();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  // 💡 Gunakan tipe status transaksi yang telah didefinisikan
  const [txnStatus, setTxnStatus] = useState<TransactionStatus>("draft");
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  const userCurrent = auth.currentUser;

  console.log("CurentUser: ", userCurrent);

  // 💡 Gabungkan loading dari auth dan chat
  const isLoading = isLoadingAuth || isLoadingChat;

  useEffect(() => {
    if (!roomChatId || isLoadingAuth) return;

    // Perbaikan: Kita harus mendengarkan dokumen Transaksi, bukan 'roomChats'
    // Asumsi: Subcollection 'messages' ada di dalam dokumen 'transactions/{txnId}'
    const txnRef = doc(db, "transactions", roomChatId);

    // 1. Listen status transaksi (header chat)
    const unsubscribeTxn = onSnapshot(txnRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // 💡 Ambil status dari dokumen transaksi
        setTxnStatus((data.status as TransactionStatus) || "draft");
      }
    });

    // 2. Listen pesan chat
    // 💡 Gunakan struktur DB yang benar: `transactions/{txnId}/messages`
    const messagesRef = collection(db, "transactions", roomChatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<MessageType, "id"> & {
          timestamp: Timestamp; // Tipe yang benar saat menerima dari Firestore
        };

        return {
          id: doc.id,
          // data.sender berisi 'user' atau 'admin' (sesuai skema DB)
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          read: data.read,
        } as ChatMessage;
      });

      setMessages(msgs);
      setIsLoadingChat(false);
      // Scroll ke bawah setelah pesan dimuat
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });

    return () => {
      unsubscribeTxn();
      unsubscribeMessages();
    };
  }, [roomChatId, isLoadingAuth]); // Dependency harus menyertakan isLoadingAuth

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomChatId || !role) return; // Pastikan role sudah dimuat

    // 💡 PENYEMPURNAAN LOGIKA PENGIRIMAN PESAN
    // Sesuai skema DB, kita simpan field 'sender' yang berisi 'user' atau 'admin'.
    // Kita asumsikan role dari useUserRole adalah peran user saat ini.
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
        read: false, // Default
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const usersList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // setUsers(usersList);
        // Console log data users
        console.log("Data Users:", usersList);
      } catch (err) {
        console.error("Gagal mengambil data users:", err);
        // setError(err);
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchUsers();
  }, []);

  if (!roomChatId) return <div>Room tidak ditemukan</div>;
  if (isLoadingAuth) return <div>Memuat data pengguna...</div>;
  if (!user) return <div>Anda harus login untuk mengakses chat.</div>; // Lindungi rute

  // Fungsi utilitas untuk menentukan tampilan badge
  const getBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
      case "paid":
      case "verified":
        return "default";
      case "waiting_confirmation":
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Menentukan apakah pengguna saat ini adalah pengirim pesan (untuk styling)
  const isSender = (messageRole: string) => messageRole === role;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg">
          Chat Transaksi (<span className="capitalize">{role}</span>)
        </h1>
        <Badge variant={getBadgeVariant(txnStatus)}>
          {txnStatus.toUpperCase().replace(/_/g, " ")}
        </Badge>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <p className="text-gray-500 text-center">Memuat pesan...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center">Belum ada pesan</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-xs break-words ${
                isSender(msg.sender)
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-gray-800 mr-auto"
              }`}
            >
              <p className="font-medium">{msg.message}</p>
              <span
                className={`text-xs block mt-1 ${
                  isSender(msg.sender) ? "text-blue-200" : "text-gray-500"
                }`}
              >
                {msg.timestamp instanceof Date
                  ? msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "..."}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white flex gap-2 border-t sticky bottom-0 z-10">
        <Input
          placeholder="Ketik pesan..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          disabled={isLoading || !role} // Nonaktifkan input jika loading atau role belum ada
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !role}>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
