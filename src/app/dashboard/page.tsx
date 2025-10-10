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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  TrendingUp,
  ArrowDownRight,
  Wallet,
  History,
  Settings,
  LogOut,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { deleteCookie } from "cookies-next";
import { listenTransactions } from "@/lib/firestore";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { BankSelect } from "@/components/commons/BankSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  wldAmount: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  txHash?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wldBalance, setWldBalance] = useState(10);
  const [idrBalance, setIdrBalance] = useState(0);
  const [wldRate, setWldRate] = useState(28500);
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

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) return router.push("/login");

      setUser(currentUser);

      const stopListen = listenTransactions(currentUser.uid, (list: any) => {
        setTransactions(
          list.map((t: any) => ({
            id: t.id,
            type: t.type || "withdrawal",
            amount: t.amount || 0,
            wldAmount: t.wldAmount || 0,
            status: t.status || "pending",
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

  // 🔹 Ambil akun pembayaran yang pernah disimpan user
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

  const handleSubmitWithdraw = async () => {
    if (
      !withdrawAmount ||
      (!selectedAccount && (!bankAccount || !bankName)) ||
      !proofFile
    ) {
      return setMessage("Lengkapi semua field");
    }

    setSubmitLoading(true);
    setMessage("");

    try {
      // jika user memilih buat akun baru
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
        // jika memilih akun lama, ambil datanya dari Firestore
        const acc = accounts.find((a) => a.id === selectedAccount);
        if (acc) {
          usedProvider = acc.provider;
          usedBankAccount = acc.account_number;
          usedBankName = acc.account_name;
        }
      }

      // kirim form ke backend
      const formData = new FormData();
      formData.append("uid", user.uid);
      formData.append("sourceAddress", sourceAddress);
      formData.append("wldAmount", withdrawAmount);
      formData.append("bankAccount", usedBankAccount);
      formData.append("bankName", usedBankName);
      formData.append("bankProvider", usedProvider);
      formData.append("proof", proofFile);
      formData.append("rate", wldRate.toString());

      const res = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setMessage("Transaksi berhasil dibuat. Silakan tunggu konfirmasi admin.");

      // reset form
      setWithdrawAmount("");
      setBankAccount("");
      setBankName("");
      setBankProvider("");
      setProofFile(null);
      setSelectedAccount("");
      setUseNewAccount(false);

      // redirect ke RoomChat
      router.push(`/chat/${result.id}`);
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan saat submit transaksi");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WLD</span>
            </div>
            <span className="font-bold text-xl">Converter</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Halo, {user?.displayName || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Saldo WLD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {wldBalance.toFixed(2)} WLD
              </div>
              <p className="text-sm opacity-90">
                ≈ Rp {(wldBalance * wldRate).toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Saldo Rupiah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                Rp {idrBalance.toLocaleString("id-ID")}
              </div>
              <p className="text-sm opacity-90">Tersedia untuk penarikan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Kurs WLD/IDR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                Rp {wldRate.toLocaleString("id-ID")}
              </div>
              <Badge className="bg-green-100 text-green-800">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="convert" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="convert">Konversi</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          {/* Multi-step Withdraw Form */}
          <TabsContent value="convert">
            <Card>
              <CardHeader>
                <CardTitle>Konversi WLD ke Rupiah</CardTitle>
                <CardDescription>
                  Tukar Worldcoin Anda ke Rupiah dengan kurs real-time
                </CardDescription>
              </CardHeader>

              {message && (
                <CardContent>
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                </CardContent>
              )}

              {step === 1 && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jumlah WLD</Label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Alamat Pengirim (Source Address)</Label>
                    <Input
                      placeholder="0xabc123..."
                      value={sourceAddress}
                      onChange={(e) => setSourceAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Masukkan alamat wallet yang kamu gunakan untuk mengirim
                      token.
                    </p>
                  </div>

                  {/* 🔹 Dropdown akun tersimpan */}
                  {accounts.length > 0 && !useNewAccount && (
                    <div className="space-y-2">
                      <Label>Pilih Akun Tujuan</Label>
                      <Select
                        value={selectedAccount}
                        onValueChange={(value) => setSelectedAccount(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- Pilih Akun --" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[220px] overflow-y-auto">
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.provider} - {acc.account_number} (
                              {acc.account_name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* 🔹 Tombol tambah akun baru */}
                  {!useNewAccount && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setUseNewAccount(true)}
                    >
                      Tambah Akun Baru
                    </Button>
                  )}

                  {/* 🔹 Form akun baru */}
                  {useNewAccount && (
                    <>
                      <Button onClick={() => setUseNewAccount(false)}>
                        Cancel
                      </Button>

                      <BankSelect
                        bankProvider={bankProvider}
                        setBankProvider={setBankProvider}
                      />

                      <div className="space-y-2">
                        <Label>No. Rekening / No. Akun</Label>
                        <Input
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Atas Nama</Label>
                        <Input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <Button onClick={() => setStep(2)} className="w-full">
                    Next
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              )}

              {step === 2 && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Transfer ke Wallet Platform</Label>
                    <Input
                      value="0x1234567890abcdef1234567890abcdef12345678"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          "0x1234567890abcdef1234567890abcdef12345678"
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Bukti Transfer</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProofFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSubmitWithdraw}
                    disabled={submitLoading}
                    className="w-full"
                  >
                    {submitLoading ? "Memproses..." : "Submit"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Riwayat Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Belum ada transaksi
                    </p>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  tx.type === "deposit"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {tx.type === "deposit"
                                  ? "Deposit"
                                  : "Withdrawal"}
                              </Badge>
                              <Badge
                                variant={
                                  tx.status === "completed"
                                    ? "default"
                                    : tx.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {tx.status === "completed" && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {tx.status === "pending" && (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {tx.status === "failed" && (
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                )}
                                {tx.status === "completed"
                                  ? "Selesai"
                                  : tx.status === "pending"
                                  ? "Pending"
                                  : "Gagal"}
                              </Badge>
                            </div>
                            <p className="font-medium mt-1">
                              {tx.type === "deposit" ? "+" : "-"}
                              {tx.wldAmount} WLD
                            </p>
                            <p className="text-sm text-gray-500">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {tx.timestamp.toLocaleString("id-ID")}
                            </p>
                            {tx.txHash && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1"
                                onClick={() => copyToClipboard(tx.txHash!)}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                {tx.txHash.slice(0, 8)}...
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

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Wallet</CardTitle>
                <CardDescription>
                  Alamat wallet untuk deposit Worldcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Alamat Wallet WLD</Label>
                  <div className="flex gap-2">
                    <Input
                      value="0x1234567890abcdef1234567890abcdef12345678"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          "0x1234567890abcdef1234567890abcdef12345678"
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Kirim WLD ke alamat ini untuk mengisi saldo
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Network</Label>
                  <div className="flex items-center gap-2">
                    <Badge>World Chain Mainnet</Badge>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Explorer
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pastikan Anda mengirim WLD ke alamat yang benar. Transaksi
                    yang sudah dikirim tidak dapat dibatalkan.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
