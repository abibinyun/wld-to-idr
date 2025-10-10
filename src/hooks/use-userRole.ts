// // /hooks/useUserRole.ts

// import { useEffect, useState } from "react";
// import { doc, getDoc, onSnapshot } from "firebase/firestore";
// import { useAuthUser } from "./use-authUser";
// import { db } from "@/lib/firebase"; // Sesuaikan path ke inisialisasi Firestore Anda
// import { User } from "@prisma/client"; // Import tipe User yang sudah Anda definisikan

// type UserData = User & { uid: string; role: string | any };

// export const useUserRole = () => {
//   const { user: firebaseUser, loading: loadingAuth } = useAuthUser();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loadingRole, setLoadingRole] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     if (loadingAuth) return;

//     // 1. Jika pengguna tidak login, set ke null dan berhenti
//     if (!firebaseUser) {
//       setUserData(null);
//       setLoadingRole(false);
//       return;
//     }

//     // 2. Jika pengguna login, buat referensi dokumen Firestore
//     const userDocRef = doc(db, "users", firebaseUser.uid);

//     // 3. Gunakan onSnapshot untuk mendengarkan data real-time
//     const unsubscribe = onSnapshot(
//       userDocRef,
//       (docSnapshot) => {
//         if (docSnapshot.exists()) {
//           const data = docSnapshot.data() as UserData;
//           setUserData({ ...data, uid: firebaseUser.uid });
//         } else {
//           // Kasus ketika user ada di Auth tapi belum ada dokumen di Firestore
//           console.warn(
//             `Firestore document for user ${firebaseUser.uid} not found.`
//           );
//           setUserData(null);
//         }
//         setLoadingRole(false);
//       },
//       (err) => {
//         // Penanganan Error
//         setError(err);
//         setLoadingRole(false);
//       }
//     );

//     // Cleanup function untuk menghentikan listener saat komponen dilepas
//     return () => unsubscribe();
//   }, [firebaseUser, loadingAuth]);

//   // Kembalikan objek yang berisi semua data, loading status, dan error
//   return {
//     user: userData,
//     role: userData?.role, // Properti yang paling Anda butuhkan
//     isLoading: loadingAuth || loadingRole,
//     error,
//   };
// };

// /hooks/useUserRole.ts

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
// 💡 KOREKSI 1: Pastikan nama file import sesuai (misalnya, 'useAuthUser' bukan 'use-authUser')
import { useAuthUser } from "./use-authUser";
import { db } from "@/lib/firebase";
// 💡 KOREKSI 2: Import tipe dari file lokal yang sudah kita definisikan
import { User } from "@/types";

// 💡 KOREKSI 3: Tipe data diperbaiki agar konsisten dengan Firestore & tipe lokal
type UserData = User & { uid: string }; // Role sudah ada di tipe User

export const useUserRole = () => {
  const { user: firebaseUser, loading: loadingAuth } = useAuthUser();
  // Gunakan tipe User yang sudah benar
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (loadingAuth) return;

    if (!firebaseUser) {
      setUserData(null);
      setLoadingRole(false);
      return;
    }

    const userDocRef = doc(db, "users", firebaseUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          // Casting ke tipe User (dari /types/index.ts)
          const data = docSnapshot.data() as User;
          setUserData({ ...data, uid: firebaseUser.uid });
        } else {
          console.warn(
            `Firestore document for user ${firebaseUser.uid} not found. Role set to 'user' default.`
          );
          // 💡 KOREKSI 4: Tetapkan data dasar jika dokumen tidak ditemukan (misal: role default 'user')
          setUserData({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: "Guest",
            phone: "",
            bank_name: "",
            bank_account: "",
            role: "user", // Default role untuk non-admin
          });
        }
        setLoadingRole(false);
      },
      (err) => {
        setError(err);
        setLoadingRole(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, loadingAuth]);

  return {
    user: userData,
    // 💡 KOREKSI 5: Pastikan role bertipe string | undefined (lebih spesifik 'user' | 'admin' | undefined)
    role: userData?.role,
    isLoading: loadingAuth || loadingRole,
    error,
  };
};
