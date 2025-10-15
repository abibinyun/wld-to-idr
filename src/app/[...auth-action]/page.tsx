"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, applyActionCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";

export default function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // State untuk form reset password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const oobCodeParam = searchParams.get("oobCode");

    if (!modeParam || !oobCodeParam) {
      setError("Tautan tidak valid. Parameter yang diperlukan tidak ada.");
      setLoading(false);
      return;
    }

    setMode(modeParam);
    setOobCode(oobCodeParam);

    // Jika mode adalah verifikasi email atau pemulihan email, langsung proses
    if (modeParam === "verifyEmail" || modeParam === "recoverEmail") {
      handleEmailAction(modeParam, oobCodeParam);
    } else {
      // Untuk mode lain (seperti resetPassword), kita tunggu input user
      setLoading(false);
    }
  }, [searchParams]);

  const handleEmailAction = async (actionMode: string, code: string) => {
    try {
      await applyActionCode(auth, code);

      if (actionMode === "verifyEmail") {
        setSuccess(
          "Email Anda telah berhasil diverifikasi! Anda akan diarahkan ke halaman login."
        );
      } else if (actionMode === "recoverEmail") {
        setSuccess(
          "Perubahan alamat email telah dibatalkan. Email lama Anda telah dipulihkan. Anda akan diarahkan ke halaman login."
        );
      }

      setTimeout(() => {
        router.push("/login");
      }, 4000);
    } catch (err: any) {
      console.error("Error handling email action:", err);
      setError("Tautan tidak valid atau telah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    if (!oobCode) {
      setError("Kode reset tidak valid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(
        "Password Anda berhasil direset! Anda akan diarahkan ke halaman login."
      );
      setTimeout(() => {
        router.push("/login");
      }, 4000);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError("Gagal mereset password. Tautan mungkin sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-cyber-accent-primary rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-cyber-bg-primary animate-pulse" />
          </div>
          <p className="text-cyber-text-primary">Memproses...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-cyber-accent-danger/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-cyber-accent-danger" />
          </div>
          <Alert className="border-cyber-accent-danger bg-cyber-bg-primary">
            <AlertDescription className="text-cyber-accent-danger">
              {error}
            </AlertDescription>
          </Alert>
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
      );
    }

    if (success) {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-cyber-accent-success/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-cyber-accent-success" />
          </div>
          <Alert className="border-cyber-accent-success bg-cyber-bg-primary">
            <AlertDescription className="text-cyber-accent-success">
              {success}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-cyber-text-muted">
            Anda akan segera dialihkan...
          </p>
        </div>
      );
    }

    switch (mode) {
      case "resetPassword":
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-cyber-accent-primary rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-cyber-bg-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-cyber-text-primary">
                Reset Password
              </CardTitle>
              <CardDescription className="text-cyber-text-muted">
                Masukkan password baru Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-cyber-text-primary"
                  >
                    Password Baru
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-cyber-text-primary"
                  >
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Mereset..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          </>
        );
      case "verifyEmail":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-cyber-accent-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-cyber-bg-primary" />
            </div>
            <p className="text-cyber-text-primary">Memverifikasi email...</p>
          </div>
        );
      case "recoverEmail":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-cyber-accent-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-cyber-bg-primary" />
            </div>
            <p className="text-cyber-text-primary">
              Membatalkan perubahan email...
            </p>
          </div>
        );
      default:
        return (
          <p className="text-cyber-text-primary">
            Mode tindakan tidak dikenali.
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
          {renderContent()}
        </Card>
        {!loading && !success && (
          <p className="mt-4 text-center text-sm text-cyber-text-muted">
            Kembali ke halaman{" "}
            <Link
              href="/login"
              className="font-medium text-cyber-accent-primary hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
