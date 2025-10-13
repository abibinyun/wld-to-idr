"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("Masukkan alamat email Anda.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
      setMessage(
        "Email reset password telah dikirim. Periksa kotak masuk Anda."
      );
      setEmail("");
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      if (error.code === "auth/user-not-found") {
        setMessage("Tidak ada akun yang terdaftar dengan email ini.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Format email tidak valid.");
      } else {
        setMessage("Gagal mengirim email reset password. Coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-cyber-accent-primary rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-cyber-bg-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-cyber-text-primary">
              Lupa Password?
            </CardTitle>
            <CardDescription className="text-cyber-text-muted">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset
              password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {message && (
                  <Alert
                    className={`${
                      message.includes("dikirim")
                        ? "border-cyber-accent-success"
                        : "border-cyber-accent-danger"
                    } bg-cyber-bg-primary`}
                  >
                    <AlertDescription
                      className={`${
                        message.includes("dikirim")
                          ? "text-cyber-accent-success"
                          : "text-cyber-accent-danger"
                      }`}
                    >
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyber-text-primary">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Mengirim..." : "Kirim Email Reset"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-cyber-accent-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-cyber-accent-success" />
                </div>
                <p className="text-cyber-text-primary">{message}</p>
                <p className="text-sm text-cyber-text-muted">
                  Jika Anda tidak menerima email dalam beberapa menit, periksa
                  folder spam Anda.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-cyber-border-default text-cyber-text-primary hover:bg-cyber-bg-primary"
                >
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Login
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {!isSuccess && (
          <p className="mt-4 text-center text-sm text-cyber-text-muted">
            Ingat password Anda?{" "}
            <Link
              href="/login"
              className="font-medium text-cyber-accent-primary hover:underline"
            >
              Kembali ke Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
