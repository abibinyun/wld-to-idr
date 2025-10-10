// /hooks/useAuthUser.ts
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase"; // Sesuaikan path ke inisialisasi Firebase Auth Anda

export const useAuthUser = () => {
  const [user, loading, error] = useAuthState(auth);
  return { user, loading, error };
};
