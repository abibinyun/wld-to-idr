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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  History,
  Settings,
  LogOut,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  BanknoteX,
  Activity,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { deleteCookie } from "cookies-next";
import { listenTransactions } from "@/lib/firestore";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { BankSelect } from "@/components/commons/BankSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { getCookie, setCookie } from "cookies-next/client";
import useTransactionStats from "@/hooks/use-transactionStats";
import InfoModal from "@/components/commons/InfoModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AmountInput from "@/components/commons/AmountInput";
import { Separator } from "@/components/ui/separator";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  wldAmount: number;
  wldTransferStatus: "pending" | "confirmed" | "failed";
  transactionStatus: "pending" | "confirmed" | "failed";
  timestamp: Date;
  txHash?: string;
  receivedAmount: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [message, setMessage] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [useNewAccount, setUseNewAccount] = useState(false);
  const [bankProvider, setBankProvider] = useState("");
  const [sourceAddress, setSourceAddress] = useState("");

  const [step, setStep] = useState<1 | 2>(1);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [wldPrice, setWldPrice] = useState<number | null>(null);

  // State untuk Settings
  const [newDisplayName, setNewDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);

  const { confirmedCount, failedCount, error } = useTransactionStats(user?.uid);

  const router = useRouter();
  const CACHE_TTL = 30 * 60 * 1000;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) return router.push("/login");

      setUser(currentUser);

      const stopListen = listenTransactions(currentUser.uid, (list: any) => {
        setTransactions(
          list.map((t: any) => ({
            id: t.id,
            type: t.type || "withdrawal",
            receivedAmount: t.receivedAmount || 0,
            wldAmount: t.wldAmount || 0,
            wldTransferStatus: t.wldTransferStatus || "pending",
            transactionStatus: t.transactionStatus || "pending",
            timestamp: t.created_at?.toDate?.() || new Date(),
            txHash: t.txHash || "",
          }))
        );
      });

      setLoading(false);
      return stopListen;
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      const q = query(collection(db, "users", user.uid, "payment_accounts"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(data);
    };
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    const fetchPrice = async () => {
      const cachedPrice = getCookie("wldPrice");
      const lastFetched: any = getCookie("wldPriceTimestamp");

      if (cachedPrice && lastFetched && Date.now() - lastFetched < CACHE_TTL) {
        setWldPrice(parseInt(cachedPrice));
        return;
      }

      setLoading(true);

      try {
        const response = await axios.get("/api/getWldPrice");
        const price = response.data.price;

        setCookie("wldPrice", price, {
          maxAge: CACHE_TTL / 1000,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
          sameSite: "lax",
        });

        setCookie("wldPriceTimestamp", Date.now(), {
          maxAge: CACHE_TTL / 1000,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
          sameSite: "lax",
        });

        setWldPrice(price);
      } catch (error) {
        console.error("Error fetching WLD price:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      deleteCookie("user-email");
      deleteCookie("auth-token");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("Alamat wallet disalin!");
  };

  // Validasi Form 1
  const validateForm1 = () => {
    if (!withdrawAmount) {
      setMessage("Jumlah WLD harus diisi");
      return false;
    }
    if (!sourceAddress) {
      setMessage("Alamat pengirim harus diisi");
      return false;
    }
    if (!useNewAccount && !selectedAccount && accounts.length > 0) {
      setMessage("Pilih akun tujuan atau tambah rekening baru");
      return false;
    }
    if (useNewAccount && (!bankAccount || !bankName || !bankProvider)) {
      setMessage("Lengkapi data rekening baru");
      return false;
    }
    return true;
  };

  // Validasi Form 2
  const validateForm2 = () => {
    if (!proofFile) {
      setMessage("Upload bukti transfer");
      return false;
    }
    return true;
  };

  // Fungsi untuk pindah ke step 2 dengan validasi
  const handleNextStep = () => {
    if (validateForm1()) {
      setMessage("");
      setStep(2);
    }
  };

  const handleSubmitWithdraw = async () => {
    if (!validateForm1() || !validateForm2()) {
      return;
    }

    if (!proofFile) {
      setMessage("Bukti transfer harus diupload");
      return;
    }

    setSubmitLoading(true);
    setMessage("");

    try {
      let usedBankAccount = bankAccount;
      let usedBankName = bankName;
      let usedProvider = bankProvider || "BANK";

      if (useNewAccount && user) {
        const ref = collection(db, "users", user.uid, "payment_accounts");
        await addDoc(ref, {
          provider: usedProvider,
          account_number: usedBankAccount,
          account_name: usedBankName,
          type: "bank",
          created_at: serverTimestamp(),
        });
      } else if (selectedAccount && accounts.length > 0) {
        const acc = accounts.find((a) => a.id === selectedAccount);
        if (acc) {
          usedProvider = acc.provider;
          usedBankAccount = acc.account_number;
          usedBankName = acc.account_name;
        }
      }

      const formData = new FormData();
      formData.append("uid", user.uid);
      formData.append("sourceAddress", sourceAddress);
      formData.append("wldAmount", withdrawAmount);
      formData.append("bankAccount", usedBankAccount);
      formData.append("bankName", usedBankName);
      formData.append("bankProvider", usedProvider);
      formData.append("proof", proofFile);
      formData.append("rate", (wldPrice ?? "").toString());

      const res = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setMessage("Transaksi berhasil dibuat. Silakan tunggu konfirmasi admin.");

      setWithdrawAmount("");
      setBankAccount("");
      setBankName("");
      setBankProvider("");
      setProofFile(null);
      setSelectedAccount("");
      setUseNewAccount(false);

      router.push(`/chat/${result.id}`);
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan saat submit transaksi");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fungsi untuk update profil
  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    setUpdateProfileLoading(true);
    setMessage("");

    try {
      // Langkah 1: Perbarui displayName di Firebase Authentication
      await updateProfile(auth.currentUser, {
        displayName: newDisplayName,
      });

      // Langkah 2: Perbarui field 'name' di Firestore
      // Buat referensi ke dokumen pengguna di koleksi 'users'
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      // Perbarui dokumen tersebut
      await updateDoc(userDocRef, {
        name: newDisplayName,
      });

      setMessage("Nama berhasil diperbarui!");
      // Perbarui state user agar nama berubah langsung di header
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Gagal memperbarui nama.");
    } finally {
      setUpdateProfileLoading(false);
    }
  };

  // Fungsi untuk update password
  const handleUpdatePassword = async () => {
    if (!auth.currentUser) return;

    if (newPassword !== confirmPassword) {
      setMessage("Password baru tidak cocok.");
      return;
    }

    setUpdatePasswordLoading(true);
    setMessage("");

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      // Re-autentikasi user dulu sebelum mengubah password
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);
      setMessage("Password berhasil diperbarui!");
      // Kosongkan field password
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        setMessage("Password saat ini salah.");
      } else {
        setMessage("Gagal memperbarui password.");
      }
    } finally {
      setUpdatePasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-accent-primary mx-auto mb-4"></div>
          <p className="text-cyber-text-muted">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg-primary">
      {/* Header */}
      <header className="border-b border-cyber-border-default bg-cyber-bg-secondary/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div
              className="flex items-center gap-2 md:gap-3"
              onClick={() => router.push("/")}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-cyber-accent-primary rounded-lg flex items-center justify-center shadow-glow-cyan">
                <span className="text-cyber-bg-primary font-bold text-sm md:text-base">
                  WLD
                </span>
              </div>
              <span className="font-bold text-lg md:text-xl text-cyber-text-primary">
                Converter
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-cyber-text-muted">
                  Halo, {user?.displayName || user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-cyber-text-muted hover:bg-cyber-bg-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-cyber-text-muted"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-cyber-bg-secondary border-cyber-border-default"
                  >
                    <DropdownMenuLabel className="font-normal text-cyber-text-primary">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Halo, {user?.displayName || "Pengguna"}
                        </p>
                        <p className="text-xs leading-none text-cyber-text-muted truncate max-w-[200px]">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-cyber-border-default" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-cyber-text-primary focus:bg-cyber-bg-primary"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <Wallet className="w-5 h-5 text-cyber-accent-primary" />
                Transaksi Berhasil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                {confirmedCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cyber-bg-secondary shadow-lg shadow-red-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <BanknoteX className="w-5 h-5 text-cyber-accent-danger" />
                Transaksi Gagal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                {failedCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <Activity className="w-5 h-5 text-cyber-accent-primary" />
                Kurs WLD/IDR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                {wldPrice
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(wldPrice)
                  : "Loading..."}
              </div>
              <Badge className="bg-cyber-accent-success/20 text-cyber-accent-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="convert" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-cyber-bg-secondary">
            <TabsTrigger
              value="convert"
              className="text-cyber-text-primary data-[state=active]:bg-cyber-bg-primary"
            >
              Konversi
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="text-cyber-text-primary data-[state=active]:bg-cyber-bg-primary"
            >
              Transaksi
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-cyber-text-primary data-[state=active]:bg-cyber-bg-primary"
            >
              Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="convert">
            <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyber-text-primary">
                  Konversi WLD ke Rupiah
                </CardTitle>
                <CardDescription className="text-cyber-text-muted">
                  Tukar Worldcoin Anda ke Rupiah dengan kurs real-time
                </CardDescription>
              </CardHeader>

              {message && (
                <CardContent>
                  <Alert className="bg-cyber-bg-primary border-cyber-accent-danger text-cyber-text-primary">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                </CardContent>
              )}

              {step === 1 && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-cyber-text-primary">
                      Jumlah WLD
                    </Label>

                    <AmountInput
                      withdrawAmount={withdrawAmount}
                      setWithdrawAmount={setWithdrawAmount}
                    />

                    <p className="text-sm text-cyber-text-muted">
                      Anda akan menerima sekitar{" "}
                      <span className="font-semibold text-cyber-text-primary">
                        {withdrawAmount && wldPrice
                          ? new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(
                              Math.round(
                                parseFloat(withdrawAmount) * wldPrice - 10000
                              )
                            )
                          : "0 IDR"}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2 justify-start items-center">
                      <Label className="text-cyber-text-primary">
                        Alamat Pengirim
                      </Label>
                      <InfoModal />
                    </div>
                    <Input
                      required
                      placeholder="0xabc123..."
                      value={sourceAddress}
                      onChange={(e) => setSourceAddress(e.target.value)}
                      className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                    />
                    <p className="text-xs text-cyber-text-muted">
                      Masukkan alamat wallet yang kamu gunakan untuk mengirim
                      token.
                    </p>
                  </div>

                  {accounts.length > 0 && !useNewAccount && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-cyber-text-primary">
                          Pilih Akun Tujuan
                        </Label>
                        <Button
                          variant="outline"
                          size={"sm"}
                          onClick={() => setUseNewAccount(true)}
                          className="text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
                        >
                          Tambah Rekening Baru
                        </Button>
                      </div>
                      <Select
                        required
                        value={selectedAccount}
                        onValueChange={(value) => setSelectedAccount(value)}
                      >
                        <SelectTrigger className="w-full bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default">
                          <SelectValue placeholder="-- Pilih Akun --" />
                        </SelectTrigger>
                        <SelectContent className="bg-cyber-bg-secondary border-cyber-border-default">
                          {accounts.map((acc) => (
                            <SelectItem
                              key={acc.id}
                              value={acc.id}
                              className="text-cyber-text-primary focus:bg-cyber-bg-primary"
                            >
                              {acc.provider} - {acc.account_number} (
                              {acc.account_name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {accounts.length === 0 && !useNewAccount && (
                    <div className="w-full text-right mb-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUseNewAccount(true)}
                        className="w-full text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
                      >
                        Tambah Rekening Baru
                      </Button>
                    </div>
                  )}

                  {useNewAccount && (
                    <>
                      <Button
                        size={"sm"}
                        onClick={() => setUseNewAccount(false)}
                        className="text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
                      >
                        Cancel
                      </Button>
                      <BankSelect
                        bankProvider={bankProvider}
                        setBankProvider={setBankProvider}
                      />
                      <div className="space-y-2">
                        <Label className="text-cyber-text-primary">
                          No. Rekening / No. Akun
                        </Label>
                        <Input
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-cyber-text-primary">
                          Atas Nama
                        </Label>
                        <Input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleNextStep}
                    className="w-full bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
                  >
                    Next <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              )}

              {step === 2 && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-cyber-text-primary">
                      Wallet Platform
                    </Label>
                    <div className="flex justify-between">
                      <Input
                        value="0x1234567890abcdef1234567890abcdef12345678"
                        readOnly
                        className="font-mono text-sm bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            "0x1234567890abcdef1234567890abcdef12345678"
                          )
                        }
                        className="text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-cyber-text-muted">
                      Salin dan gunakan alamat ini untuk transfer.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cyber-text-primary">
                      Upload Bukti Transfer
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProofFile(e.target.files?.[0] || null)
                      }
                      className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default file:text-cyber-text-muted file:border-cyber-border-default"
                    />
                  </div>

                  <div className="text-xs md:text-base flex items-center space-x-1 mb-3">
                    <Button
                      disabled={submitLoading}
                      onClick={() => setStep(1)}
                      className="w-1/4 text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
                    >
                      <ArrowLeft className="ml-2 w-3 md:w-4 h-3 md:h-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitWithdraw}
                      disabled={submitLoading}
                      className="w-3/4 bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
                    >
                      {submitLoading ? "Memproses..." : "Submit"}
                      <ArrowRight className="ml-2 w-3 md:w-4 h-3 md:h-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-cyber-text-primary">
                  <History className="w-5 h-5 text-cyber-accent-primary" />
                  Riwayat Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-cyber-text-muted py-8">
                      Belum ada transaksi
                    </p>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`${
                          tx.transactionStatus !== "confirmed" &&
                          "hover:cursor-pointer hover:bg-cyber-bg-primary"
                        } border border-cyber-border-default rounded-lg p-3 md:p-4 transition-colors`}
                        onClick={() =>
                          tx.transactionStatus !== "confirmed" &&
                          router.push(`/chat/${tx.id}`)
                        }
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                          <div className="w-full">
                            <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-2">
                              <Badge
                                variant={
                                  tx.type === "deposit"
                                    ? "default"
                                    : "secondary"
                                }
                                className={`text-xs ${
                                  tx.type === "deposit"
                                    ? "bg-cyber-accent-primary/20 text-cyber-accent-primary"
                                    : "bg-cyber-accent-warning/20 text-cyber-accent-warning"
                                }`}
                              >
                                {tx.type === "deposit"
                                  ? "Deposit"
                                  : "Withdrawal"}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  tx.wldTransferStatus === "confirmed"
                                    ? "bg-cyber-accent-success/20 text-cyber-accent-success"
                                    : tx.wldTransferStatus === "pending"
                                    ? "bg-cyber-accent-warning/20 text-cyber-accent-warning"
                                    : "bg-cyber-accent-danger/20 text-cyber-accent-danger"
                                }`}
                              >
                                {tx.wldTransferStatus === "confirmed" && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {tx.wldTransferStatus === "pending" && (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {tx.wldTransferStatus === "failed" && (
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                )}
                                <span className="hidden sm:inline">
                                  {tx.wldTransferStatus === "confirmed"
                                    ? "Token terkirim"
                                    : tx.wldTransferStatus === "pending"
                                    ? "Token pending"
                                    : "Token tidak terkirim"}
                                </span>
                                <span className="sm:hidden">
                                  {tx.wldTransferStatus === "confirmed"
                                    ? "Terkirim"
                                    : tx.wldTransferStatus === "pending"
                                    ? "Pending"
                                    : "Gagal"}
                                </span>
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  tx.transactionStatus === "confirmed"
                                    ? "bg-cyber-accent-success/20 text-cyber-accent-success"
                                    : tx.transactionStatus === "pending"
                                    ? "bg-cyber-accent-warning/20 text-cyber-accent-warning"
                                    : "bg-cyber-accent-danger/20 text-cyber-accent-danger"
                                }`}
                              >
                                {tx.transactionStatus === "confirmed" && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {tx.transactionStatus === "pending" && (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {tx.transactionStatus === "failed" && (
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                )}
                                <span className="hidden sm:inline">
                                  {tx.transactionStatus === "confirmed"
                                    ? "Transaksi sukses"
                                    : tx.transactionStatus === "pending"
                                    ? "Transaksi berlangsung"
                                    : "Transaksi gagal"}
                                </span>
                                <span className="sm:hidden">
                                  {tx.transactionStatus === "confirmed"
                                    ? "Sukses"
                                    : tx.transactionStatus === "pending"
                                    ? "Berlangsung"
                                    : "Gagal"}
                                </span>
                              </Badge>
                            </div>
                            <p className="font-medium text-base md:text-lg mt-1 text-cyber-text-primary">
                              {tx.wldAmount} WLD
                            </p>
                            <p className="text-sm text-cyber-text-muted">
                              {tx.receivedAmount != null
                                ? new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  }).format(tx.receivedAmount)
                                : "Loading..."}
                            </p>
                          </div>
                          <div className="text-right w-full md:w-auto">
                            <p className="text-xs md:text-sm text-cyber-text-muted">
                              {tx.timestamp.toLocaleString("id-ID")}
                            </p>
                            {tx.txHash && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-8 px-2 text-xs md:text-sm text-cyber-text-muted hover:bg-cyber-bg-primary"
                                onClick={() => copyToClipboard(tx.txHash!)}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">
                                  {tx.txHash.slice(0, 8)}...
                                </span>
                                <span className="sm:hidden">Salin Hash</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyber-text-primary flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Pengaturan Akun
                </CardTitle>
                <CardDescription className="text-cyber-text-muted">
                  Kelola informasi profil dan keamanan akun Anda.
                </CardDescription>
              </CardHeader>

              {message && (
                <CardContent>
                  <Alert className="bg-cyber-bg-primary border-cyber-border-default text-cyber-text-primary">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                </CardContent>
              )}

              <CardContent className="space-y-6">
                {/* Section: Ubah Nama */}
                <div>
                  <h3 className="text-lg font-medium text-cyber-text-primary mb-4">
                    Ubah Nama Tampilan
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="displayName"
                        className="text-cyber-text-primary"
                      >
                        Nama
                      </Label>
                      <Input
                        id="displayName"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileLoading || !newDisplayName}
                      className="bg-cyber-accent-primary hover:bg-cyber-accent-hover"
                    >
                      {updateProfileLoading ? "Menyimpan..." : "Simpan Nama"}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-cyber-border-default" />

                {/* Section: Ubah Password */}
                <div>
                  <h3 className="text-lg font-medium text-cyber-text-primary mb-4">
                    Ubah Password
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-cyber-text-primary"
                      >
                        Password Saat Ini
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                      />
                    </div>
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
                        className="bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                      />
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={
                        updatePasswordLoading ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="bg-cyber-accent-primary hover:bg-cyber-accent-hover"
                    >
                      {updatePasswordLoading
                        ? "Memperbarui..."
                        : "Perbarui Password"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
