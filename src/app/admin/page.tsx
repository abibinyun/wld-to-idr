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
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "@/lib/auth";
import { deleteCookie } from "cookies-next";

import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  Firestore,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface User {
  id: string;
  email: string;
  displayName: string;
  wldBalance: number;
  idrBalance: number;
  status: "active" | "suspended" | "pending";
  joinDate: Date;
  lastActive: Date;
}

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "deposit" | "withdrawal";
  amount: number;
  wldAmount: number;
  status: "pending" | "completed" | "failed";
  created_at: Date;
  txHash?: string;
  proofUrl?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeUsers: 890,
    totalVolume: 2847500000,
    monthlyVolume: 285000000,
    pendingTransactions: 12,
    totalWLD: 15420.5,
  });

  // Auth & admin check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        if (currentUser.email !== "abii.manyun@gmail.com") {
          router.push("/dashboard");
          return;
        }
        setUser(currentUser);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  // Firestore transaksi realtime
  useEffect(() => {
    console.log("user: ", user);
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txList: Transaction[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          type: data.type,
          amount: data.amount,
          wldAmount: data.wldAmount,
          status: data.status,
          created_at: data.created_at?.toDate() || new Date(),
          txHash: data.txHash || null,
          proofUrl: data.proofUrl || null,
        };
      });

      console.log("TrxList: ", txList);
      setTransactions(txList);
    });

    return () => unsubscribe();
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

  const handleApproveTransaction = async (txId: string) => {
    try {
      const txRef = doc(db, "transactions", txId);
      await updateDoc(txRef, { status: "completed" });
      setMessage("Transaksi disetujui");
    } catch (error) {
      setMessage("Gagal menyetujui transaksi");
    }
  };

  const handleRejectTransaction = async (txId: string) => {
    try {
      const txRef = doc(db, "transactions", txId);
      await updateDoc(txRef, { status: "failed" });
      setMessage("Transaksi ditolak");
    } catch (error) {
      setMessage("Gagal menolak transaksi");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter((tx) => {
    const email = tx.userEmail || "";
    const matchesSearch = email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
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
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <span className="font-bold text-xl">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Administrator</Badge>
            <span className="text-sm text-gray-600">
              {user?.displayName || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Total Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {stats.totalUsers.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-green-600">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% bulan ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Pengguna Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {stats.activeUsers.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-gray-500">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Volume Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                Rp {(stats.totalVolume / 1000000).toFixed(0)}M
              </div>
              <p className="text-sm text-gray-500">
                {stats.totalWLD.toFixed(1)} WLD total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Transaksi Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {stats.pendingTransactions}
              </div>
              <p className="text-sm text-orange-600">Menunggu persetujuan</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Transaksi</CardTitle>
                <CardDescription>
                  Monitoring dan persetujuan transaksi pengguna
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Cari berdasarkan email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada transaksi ditemukan
                    </p>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          if (tx.id) {
                            router.push(`/chat/${tx.id}`);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
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
                                {tx.status}
                              </Badge>
                            </div>
                            <p className="font-medium">{tx.userEmail || "—"}</p>
                            <p className="text-sm text-gray-500">
                              {tx.type === "deposit" ? "+" : "-"}
                              {tx.wldAmount} WLD = Rp{" "}
                              {tx.amount.toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tx.created_at.toLocaleString("id-ID")}
                            </p>
                          </div>
                          {tx.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // biar klik tombol tidak trigger redirect
                                  handleApproveTransaction(tx.id);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectTransaction(tx.id);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Pengguna</CardTitle>
                <CardDescription>
                  Daftar semua pengguna terdaftar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Cari pengguna..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada pengguna ditemukan
                    </p>
                  ) : (
                    filteredUsers.map((u) => (
                      <div key={u.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">{u.displayName}</p>
                              <Badge
                                variant={
                                  u.status === "active"
                                    ? "default"
                                    : u.status === "suspended"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {u.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span>WLD: {u.wldBalance}</span>
                              <span>
                                IDR: Rp {u.idrBalance.toLocaleString("id-ID")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Join: {u.joinDate.toLocaleDateString("id-ID")} |
                              Last active:{" "}
                              {u.lastActive.toLocaleDateString("id-ID")}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
                <CardDescription>Konfigurasi parameter sistem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Kurs WLD/IDR</Label>
                    <Input type="number" defaultValue="28500" />
                    <p className="text-sm text-gray-500">
                      Update manual kurs konversi
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Fee Transaksi (%)</Label>
                    <Input type="number" defaultValue="2.5" step="0.1" />
                    <p className="text-sm text-gray-500">
                      Fee yang dibebankan ke pengguna
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Withdrawal (WLD)</Label>
                    <Input type="number" defaultValue="1" step="0.1" />
                    <p className="text-sm text-gray-500">
                      Minimal penarikan WLD
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Withdrawal (WLD)</Label>
                    <Input type="number" defaultValue="1000" step="10" />
                    <p className="text-sm text-gray-500">
                      Maksimal penarikan WLD per transaksi
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Status Sistem</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>Service Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>Blockchain Sync</span>
                      <Badge className="bg-green-100 text-green-800">
                        Synced
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>API Rate Limit</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Normal
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button>Simpan Pengaturan</Button>
                  <Button variant="outline">Restart Service</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {message && (
          <Alert className="mt-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
