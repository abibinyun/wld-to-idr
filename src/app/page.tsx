"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Users,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCookie, setCookie } from "cookies-next";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/commons/ThemeToggle";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [wldPrice, setWldPrice] = useState(0);
  const [isLoading, setLoading] = useState(false);

  const CACHE_TTL = 30 * 60 * 1000;

  useEffect(() => {
    const fetchPrice = async () => {
      const cachedPrice: any = getCookie("wldPrice");
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

  return (
    <div className="min-h-screen bg-cyber-bg-primary text-cyber-text-primary transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-cyber-border-default bg-cyber-bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-cyber-accent-primary rounded-lg flex items-center justify-center shadow-glow-cyan">
                <span className="text-cyber-bg-primary font-bold text-sm md:text-base">
                  WLD
                </span>
              </div>
              <span className="font-bold text-lg md:text-xl">Converter</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-cyber-text-muted hover:text-cyber-accent-primary transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#how-it-works"
                className="text-cyber-text-muted hover:text-cyber-accent-primary transition-colors"
              >
                Cara Kerja
              </Link>
              <Link
                href="#about"
                className="text-cyber-text-muted hover:text-cyber-accent-primary transition-colors"
              >
                Tentang
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button className="bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="text-cyber-text-muted hover:bg-cyber-bg-secondary"
                      >
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105">
                        Daftar
                      </Button>
                    </Link>
                  </>
                )}
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
                    className="w-56 bg-cyber-bg-secondary border-cyber-border-default"
                  >
                    <DropdownMenuLabel className="font-normal text-cyber-text-primary">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Menu</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-cyber-border-default" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="#features"
                        className="w-full cursor-pointer text-cyber-text-muted focus:bg-cyber-bg-primary"
                      >
                        Fitur
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="#how-it-works"
                        className="w-full cursor-pointer text-cyber-text-muted focus:bg-cyber-bg-primary"
                      >
                        Cara Kerja
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="#about"
                        className="w-full cursor-pointer text-cyber-text-muted focus:bg-cyber-bg-primary"
                      >
                        Tentang
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-cyber-border-default" />
                    {user ? (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="w-full cursor-pointer"
                        >
                          <Button className="w-full bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105">
                            Dashboard
                          </Button>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="p-0">
                          <Link href="/login" className="w-full">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-cyber-text-muted hover:bg-cyber-bg-primary"
                            >
                              Masuk
                            </Button>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link href="/register" className="w-full">
                            <Button className="w-full justify-start bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105">
                              Daftar
                            </Button>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4  bg-cyber-accent-success/20 text-cyber-accent-success hover:bg-cyber-accent-success/30">
            <TrendingUp className="w-4 h-4 mr-1" />
            Real-time Conversion
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-cyber-text-primary mb-6">
            Tukar Worldcoin (WLD) ke
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent-primary to-cyan-400">
              {" "}
              Rupiah
            </span>
          </h1>
          <p className="text-xl text-cyber-text-muted mb-8 max-w-2xl mx-auto">
            Platform aman dan transparan untuk menukar Worldcoin ke Rupiah
            dengan kurs real-time dan verifikasi blockchain instan.
          </p>

          <Card className="max-w-md mx-auto mb-8 border-2 border-cyber-accent-primary bg-cyber-bg-secondary shadow-glow-cyan-important">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-cyber-text-muted mb-2">
                  Kurs Saat Ini
                </p>
                <div className="text-3xl font-bold text-cyber-accent-primary">
                  1 WLD ={" "}
                  {wldPrice
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(wldPrice)
                    : "Loading..."}
                </div>
                <p className="text-xs text-cyber-text-muted mt-2">
                  Update real-time
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105">
                  Mulai Konversi
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button className="bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105">
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-3 border-cyber-text-muted text-cyber-text-muted hover:bg-cyber-bg-secondary"
                  >
                    Masuk
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-cyber-bg-secondary">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-cyber-text-primary mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xl text-cyber-text-muted max-w-2xl mx-auto">
              Platform yang dirancang untuk keamanan, transparansi, dan
              kemudahan pengguna.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg shadow-cyan-500/10 bg-cyber-bg-primary hover:shadow-xl hover:shadow-cyan-500/20 transition-all">
              <div className="w-12 h-12 bg-cyber-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-cyber-accent-primary" />
              </div>
              <CardTitle className="mb-2 text-cyber-text-primary">
                Aman & Terpercaya
              </CardTitle>
              <CardDescription className="text-cyber-text-muted">
                Dilengkapi dengan verifikasi blockchain dan enkripsi data
                end-to-end.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg shadow-green-500/10 bg-cyber-bg-primary hover:shadow-xl hover:shadow-green-500/20 transition-all">
              <div className="w-12 h-12 bg-cyber-accent-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-cyber-accent-success" />
              </div>
              <CardTitle className="mb-2 text-cyber-text-primary">
                Konversi Instan
              </CardTitle>
              <CardDescription className="text-cyber-text-muted">
                Proses konversi cepat dengan transfer dana langsung ke rekening
                Anda.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg shadow-purple-500/10 bg-cyber-bg-primary hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="mb-2 text-cyber-text-primary">
                Kurs Real-time
              </CardTitle>
              <CardDescription className="text-cyber-text-muted">
                Update kurs secara real-time mengikuti pasar cryptocurrency
                global.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg shadow-orange-500/10 bg-cyber-bg-primary hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              <div className="w-12 h-12 bg-cyber-accent-warning/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-cyber-accent-warning" />
              </div>
              <CardTitle className="mb-2 text-cyber-text-primary">
                Support 24/7
              </CardTitle>
              <CardDescription className="text-cyber-text-muted">
                Tim support siap membantu Anda kapan saja selama 24 jam.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-cyber-text-primary mb-4">
              Cara Kerja
            </h2>
            <p className="text-xl text-cyber-text-muted">
              Tiga langkah mudah untuk menukar WLD ke Rupiah
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyber-accent-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-cyber-text-primary">
                Daftar & Verifikasi
              </h3>
              <p className="text-cyber-text-muted">
                Buat akun dan lengkapi verifikasi identitas untuk keamanan
                transaksi.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyber-accent-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-cyber-text-primary">
                Kirim WLD
              </h3>
              <p className="text-cyber-text-muted">
                Kirim Worldcoin ke alamat wallet yang tersedia dengan jumlah
                yang diinginkan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyber-accent-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-cyber-text-primary">
                Terima Rupiah
              </h3>
              <p className="text-cyber-text-muted">
                Dana Rupiah akan langsung ditransfer ke rekening bank Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyber-bg-secondary to-cyber-accent-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Memulai Konversi WLD Anda?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bergabunglah dengan ribuan pengguna yang sudah mempercayai kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="default"
                className="text-lg px-8 py-3 bg-white text-gray-900 hover:bg-gray-100"
              >
                Lihat Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cyber-bg-primary text-cyber-text-primary py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-cyber-accent-primary rounded-lg flex items-center justify-center shadow-glow-cyan">
                  <span className="text-cyber-bg-primary font-bold text-sm md:text-base">
                    WLD
                  </span>
                </div>
                <span className="font-bold text-xl">Converter</span>
              </div>
              <p className="text-cyber-text-muted">
                Platform terpercaya untuk konversi Worldcoin ke Rupiah.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-cyber-text-primary">
                Produk
              </h4>
              <ul className="space-y-2 text-cyber-text-muted">
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Konversi WLD
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    API Integration
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Mobile App
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-cyber-text-primary">
                Support
              </h4>
              <ul className="space-y-2 text-cyber-text-muted">
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-cyber-text-primary">
                Legal
              </h4>
              <ul className="space-y-2 text-cyber-text-muted">
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-cyber-accent-primary transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cyber-border-default mt-8 pt-8 text-center text-cyber-text-muted">
            <p>&copy; 2024 WLD Converter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
