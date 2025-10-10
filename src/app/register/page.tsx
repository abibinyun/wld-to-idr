// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Separator } from '@/components/ui/separator';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Eye, EyeOff, Mail, Lock, User, Chrome, Shield } from 'lucide-react';
// import Link from 'next/link';
// import { signInWithGoogle } from '@/lib/auth';
// import { auth } from '@/lib/firebase';
// import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// export default function Register() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         router.push('/dashboard');
//       }
//     });
//     return unsubscribe;
//   }, [router]);

//   const validateForm = () => {
//     if (!name || !email || !password || !confirmPassword) {
//       setError('Semua field harus diisi');
//       return false;
//     }
//     if (password.length < 8) {
//       setError('Password minimal 8 karakter');
//       return false;
//     }
//     if (password !== confirmPassword) {
//       setError('Password tidak cocok');
//       return false;
//     }
//     if (!agreeTerms) {
//       setError('Anda harus menyetujui syarat dan ketentuan');
//       return false;
//     }
//     return true;
//   };

//   const handleEmailRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       await updateProfile(userCredential.user, {
//         displayName: name
//       });
//       router.push('/dashboard');
//     } catch (error: any) {
//       setError(error.message || 'Terjadi kesalahan saat pendaftaran');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleRegister = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       await signInWithGoogle();
//       router.push('/dashboard');
//     } catch (error: any) {
//       setError(error.message || 'Terjadi kesalahan saat daftar dengan Google');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold">WLD</span>
//             </div>
//             <span className="font-bold text-2xl">Converter</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
//           <p className="text-gray-600 mt-2">Bergabunglah dengan platform konversi WLD terpercaya</p>
//         </div>

//         <Card className="shadow-lg">
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl text-center">Daftar</CardTitle>
//             <CardDescription className="text-center">
//               Pilih metode pendaftaran untuk memulai
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Google Register */}
//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={handleGoogleRegister}
//               disabled={loading}
//             >
//               <Chrome className="w-4 h-4 mr-2" />
//               Daftar dengan Google
//             </Button>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <Separator className="w-full" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-2 text-gray-500">Atau</span>
//               </div>
//             </div>

//             {/* Email Register Form */}
//             <form onSubmit={handleEmailRegister} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Nama Lengkap</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="name"
//                     type="text"
//                     placeholder="John Doe"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="nama@email.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Minimal 8 karakter"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="pl-10 pr-10"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="confirmPassword"
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     placeholder="Ulangi password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className="pl-10 pr-10"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="terms"
//                   checked={agreeTerms}
//                   onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
//                 />
//                 <Label htmlFor="terms" className="text-sm">
//                   Saya menyetujui{' '}
//                   <Link href="/terms" className="text-blue-600 hover:underline">
//                     Syarat & Ketentuan
//                   </Link>{' '}
//                   dan{' '}
//                   <Link href="/privacy" className="text-blue-600 hover:underline">
//                     Kebijakan Privasi
//                   </Link>
//                 </Label>
//               </div>

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <Button type="submit" className="w-full" disabled={loading}>
//                 {loading ? 'Memproses...' : 'Daftar Sekarang'}
//               </Button>
//             </form>

//             <div className="text-center text-sm text-gray-600">
//               Sudah punya akun?{' '}
//               <Link href="/login" className="text-blue-600 hover:underline font-medium">
//                 Masuk
//               </Link>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Security Notice */}
//         <div className="mt-6 text-center">
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <div className="flex items-center justify-center gap-2 mb-2">
//               <Shield className="w-4 h-4 text-blue-600" />
//               <span className="text-sm font-medium text-blue-900">Keamanan Terjamin</span>
//             </div>
//             <p className="text-xs text-blue-700">
//               Data Anda dilindungi dengan enkripsi end-to-end dan verifikasi blockchain.
//               Kami compliant dengan standar keamanan global.
//             </p>
//           </div>
//         </div>

//         {/* Benefits */}
//         <div className="mt-6 text-center">
//           <p className="text-xs text-gray-500 mb-2">Bergabunglah dan dapatkan:</p>
//           <div className="flex justify-center gap-4 text-xs text-gray-600">
//             <span>✓ Konversi Real-time</span>
//             <span>✓ Biaya Rendah</span>
//             <span>✓ Support 24/7</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  const router = useRouter();

  // 🔍 Redirect ke dashboard jika sudah login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/dashboard");
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
      // 1️⃣ Buat akun di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2️⃣ Update profil Auth
      await updateProfile(user, { displayName: name });

      // 3️⃣ Simpan user ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: "user", // default role
        created_at: serverTimestamp(),
      });

      // 4️⃣ Redirect ke halaman onboarding (jika mau langsung isi profil)
      router.push("/dashboard");
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

      // Pastikan user juga tersimpan di Firestore
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

      router.push("/onboarding");
    } catch (err: any) {
      console.error("Google register error:", err);
      setError(err.message || "Terjadi kesalahan saat daftar dengan Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Daftar Akun</h1>
      {error && (
        <p className="text-red-500 text-sm text-center mb-3">{error}</p>
      )}

      <form onSubmit={handleEmailRegister} className="space-y-3">
        <Input
          placeholder="Nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Alamat email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Konfirmasi kata sandi"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={() => setAgreeTerms(!agreeTerms)}
          />
          <label className="text-sm">
            Saya menyetujui{" "}
            <span className="text-blue-600 cursor-pointer">
              syarat dan ketentuan
            </span>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Mendaftarkan..." : "Daftar"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Atau daftar dengan</p>
        <Button onClick={handleGoogleRegister} className="w-full">
          Daftar dengan Google
        </Button>
      </div>
    </div>
  );
}
