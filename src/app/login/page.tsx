"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import Link from "next/link";
import { signInWithGoogle } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { setCookie } from "cookies-next";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        router.push("/dashboard");
      }
    });
    return unsubscribe;
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user && !user.emailVerified) {
        setError(
          "Email Anda belum terverifikasi. Silakan periksa email Anda untuk verifikasi. cek Email dan folder Spam"
        );
        return;
      }

      if (user) {
        const token = await user.getIdToken();
        setCookie("auth-token", token, { path: "/" });
        setCookie("user-email", user.email, { path: "/" });
      }

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const role = userData.role;

          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } else {
          setError("Data pengguna tidak ditemukan.");
        }
      }
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();

      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        setError("Email Anda belum diverifikasi.");
        return;
      }

      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login dengan Google");
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
            Selamat Datang Kembali
          </h1>
          <p className="text-cyber-text-muted mt-2">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        <Card className="shadow-lg shadow-cyan-500/10 bg-cyber-bg-secondary">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-cyber-text-primary">
              Masuk
            </CardTitle>
            <CardDescription className="text-center text-cyber-text-muted">
              Pilih metode login untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Masuk dengan Google
            </Button>

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

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyber-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-cyber-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cyber-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-cyber-text-muted" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-cyber-text-muted hover:text-cyber-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-cyber-accent-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <div className="text-center text-sm text-cyber-text-muted">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-cyber-accent-primary hover:underline font-medium"
              >
                Daftar sekarang
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-cyber-text-muted">
            <strong>Keamanan Terjamin:</strong> Data Anda dilindungi dengan
            enkripsi end-to-end dan verifikasi dua faktor.
          </p>
        </div>
      </div>
    </div>
  );
}
