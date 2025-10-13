"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth";
import { sendEmailVerification } from "firebase/auth";
import { Chrome } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.push("/dashboard");
      }
    });
    return unsubscribe;
  }, [router]);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Semua field harus diisi");
      return false;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return false;
    }
    if (!agreeTerms) {
      setError("Anda harus menyetujui syarat dan ketentuan");
      return false;
    }
    return true;
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: "user",
        created_at: serverTimestamp(),
      });

      setError("Silakan cek email Anda untuk memverifikasi akun.");
      setMessage(
        "Kami telah mengirimkan email verifikasi. Periksa inbox atau folder spam."
      );

      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.message || "Terjadi kesalahan saat pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithGoogle();

      await sendEmailVerification(userCredential);

      await setDoc(
        doc(db, "users", userCredential.uid),
        {
          uid: userCredential.uid,
          name: userCredential.displayName || "",
          email: userCredential.email,
          role: "user",
          hasOnboarded: false,
          created_at: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage(
        "Kami telah mengirimkan email verifikasi. Periksa inbox atau folder spam."
      );

      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (err: any) {
      console.error("Google register error:", err);
      setError(err.message || "Terjadi kesalahan saat daftar dengan Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-cyber-accent-primary rounded-lg flex items-center justify-center shadow-glow-cyan">
              <span className="text-cyber-bg-primary font-bold">WLD</span>
            </div>
            <span className="font-bold text-2xl text-cyber-text-primary">
              Converter
            </span>
          </div>
          <h1 className="text-2xl font-bold text-cyber-text-primary">
            Buat Akun Baru
          </h1>
          <p className="text-cyber-text-muted mt-2">
            Bergabunglah untuk mulai mengkonversi WLD Anda
          </p>
        </div>

        <div className="p-6 bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10 rounded-lg">
          {error && (
            <p className="text-cyber-accent-danger text-sm text-center mb-3">
              {error}
            </p>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <Input
                placeholder="Nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Alamat email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
              />
            </div>
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
              />
            </div>
            <div>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="accent-cyber-accent-primary"
              />
              <label className="text-sm text-cyber-text-primary">
                Saya menyetujui
                <span className="text-cyber-accent-primary cursor-pointer hover:underline">
                  syarat dan ketentuan
                </span>
              </label>
            </div>

            {message && (
              <div className="mt-4 text-center text-cyber-accent-success">
                <p>{message}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-cyber-bg-secondary px-2 text-cyber-text-muted">
                  Atau
                </span>
              </div>
            </div>
            <Button
              onClick={handleGoogleRegister}
              className="w-full mt-4 text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Daftar dengan Google
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-cyber-text-muted mt-6">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-cyber-accent-primary hover:underline font-medium"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
