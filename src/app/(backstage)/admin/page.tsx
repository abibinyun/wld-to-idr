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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  MoreVertical,
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
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  receivedAmount: number;
  wldAmount: number;
  wldTransferStatus: "pending" | "confirmed" | "failed";
  transactionStatus: "pending" | "confirmed" | "failed";
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
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const role = userSnap.data().role;

          if (role !== "admin") {
            router.push("/dashboard");
            return;
          }

          setUser(currentUser);
          setLoading(false);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Gagal mengambil data role:", error);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Firestore transaksi realtime
  useEffect(() => {
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
          receivedAmount: data.receivedAmount,
          wldAmount: data.wldAmount,
          wldTransferStatus: data.wldTransferStatus,
          transactionStatus: data.transactionStatus,
          created_at: data.created_at?.toDate() || new Date(),
          txHash: data.txHash || null,
          proofUrl: data.proofUrl || null,
        };
      });
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
    const matchesStatus =
      statusFilter === "all" || tx.wldTransferStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-accent-primary mx-auto mb-4"></div>
          <p className="text-cyber-text-muted">Memuat dashboard admin...</p>
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
            {/* Logo and Title */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-cyber-accent-warning rounded-lg flex items-center justify-center shadow-glow-cyan">
                <span className="text-cyber-bg-primary font-bold text-sm md:text-base">
                  AD
                </span>
              </div>
              <span className="font-bold text-lg md:text-xl text-cyber-text-primary">
                Admin Panel
              </span>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Desktop View */}
              <div className="hidden md:flex items-center gap-4">
                <Badge className="bg-cyber-accent-warning/20 text-cyber-accent-warning">
                  Administrator
                </Badge>
                <span className="text-sm text-cyber-text-muted">
                  {user?.displayName || user?.email}
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

              {/* Mobile View */}
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
                          {user?.displayName || "Admin"}
                        </p>
                        <p className="text-xs leading-none text-cyber-text-muted">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-cyber-border-default" />
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-cyber-text-primary focus:bg-cyber-bg-primary">
                      <Badge className="bg-cyber-accent-warning/20 text-cyber-accent-warning text-xs">
                        Administrator
                      </Badge>
                    </DropdownMenuItem>
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
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <Users className="w-5 h-5 text-cyber-accent-primary" />
                Total Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                {stats.totalUsers.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-cyber-accent-success">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% bulan ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cyber-bg-secondary shadow-lg shadow-green-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <Activity className="w-5 h-5 text-cyber-accent-success" />
                Pengguna Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                {stats.activeUsers.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-cyber-text-muted">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                dari total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cyber-bg-secondary shadow-lg shadow-purple-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <DollarSign className="w-5 h-5 text-cyber-accent-primary" />
                Volume Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                Rp {(stats.totalVolume / 1000000).toFixed(0)}M
              </div>
              <p className="text-sm text-cyber-text-muted">
                {stats.totalWLD.toFixed(1)} WLD total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cyber-bg-secondary shadow-lg shadow-orange-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-cyber-text-primary">
                <Clock className="w-5 h-5 text-cyber-accent-warning" />
                Transaksi Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-cyber-text-primary">
                {stats.pendingTransactions}
              </div>
              <p className="text-sm text-cyber-accent-warning">
                Menunggu persetujuan
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 bg-cyber-bg-secondary">
            <TabsTrigger
              value="transactions"
              className="text-cyber-text-primary data-[state=active]:bg-cyber-bg-primary"
            >
              Transaksi
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-cyber-bg-secondary shadow-lg shadow-cyan-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl text-cyber-text-primary">
                  Manajemen Transaksi
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-cyber-text-muted">
                  Monitoring dan persetujuan transaksi pengguna
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter Section */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex-1 w-full">
                    <Input
                      placeholder="Cari berdasarkan email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-10 bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md h-10 w-full md:w-auto bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto h-10 text-cyber-text-primary border-cyber-border-default hover:bg-cyber-bg-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export</span>
                    <span className="sm:hidden">Exp</span>
                  </Button>
                </div>

                {/* Transaction List */}
                <div className="space-y-3 md:space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-cyber-text-muted py-8">
                      Tidak ada transaksi ditemukan
                    </p>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="border border-cyber-border-default rounded-lg p-3 md:p-4 hover:bg-cyber-bg-primary cursor-pointer transition-colors"
                        onClick={() => router.push(`/chat/${tx.id}`)}
                      >
                        <div className="flex flex-col gap-3">
                          {/* Status Badges */}
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <Badge
                              variant={
                                tx.type === "deposit" ? "default" : "secondary"
                              }
                              className={`text-xs ${
                                tx.type === "deposit"
                                  ? "bg-cyber-accent-primary/20 text-cyber-accent-primary"
                                  : "bg-cyber-accent-warning/20 text-cyber-accent-warning"
                              }`}
                            >
                              {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
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
                                  : "Token gagal"}
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

                          {/* Transaction Details */}
                          <div className="flex-1">
                            <p className="font-medium text-base md:text-lg text-cyber-text-primary">
                              —
                            </p>
                            <p className="text-sm text-cyber-text-muted mt-1">
                              {tx.wldAmount} WLD = Rp{" "}
                              {tx.receivedAmount.toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs text-cyber-text-muted mt-1">
                              {tx.created_at.toLocaleString("id-ID")}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          {tx.wldTransferStatus === "pending" && (
                            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveTransaction(tx.id);
                                }}
                                className="bg-cyber-accent-success hover:bg-cyber-accent-success-hover text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">
                                  Setujui
                                </span>
                                <span className="sm:hidden">✓ Setujui</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectTransaction(tx.id);
                                }}
                                className="bg-cyber-accent-danger hover:bg-cyber-accent-danger-hover text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Tolak</span>
                                <span className="sm:hidden">✕ Tolak</span>
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
        </Tabs>

        {message && (
          <Alert className="mt-6 bg-cyber-bg-primary border-cyber-border-default text-cyber-text-primary">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
