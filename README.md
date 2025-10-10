# WLD → Rupiah Converter

Aplikasi web MVP untuk konversi Worldcoin (WLD) ke Rupiah dengan teknologi Next.js 15, Firebase, dan integrasi blockchain.

## 🚀 Fitur

### User Features
- **Frontpage** - Landing page yang menarik dengan informasi real-time
- **Authentication** - Login dan registrasi dengan Firebase Auth (Google & Email)
- **Dashboard User** - 
  - Monitoring saldo WLD dan Rupiah
  - Konversi real-time
  - Riwayat transaksi
  - Informasi wallet
- **Keamanan** - Enkripsi end-to-end dan verifikasi blockchain

### Admin Features
- **Dashboard Admin** - 
  - Monitoring semua transaksi
  - Manajemen pengguna
  - Approval transaksi pending
  - Statistik dan laporan
  - Pengaturan sistem

### Technical Features
- **API Routes** - RESTful API untuk konversi dan transaksi
- **Blockchain Integration** - Webhook Alchemy untuk verifikasi transaksi
- **Real-time Updates** - Kurs WLD/IDR real-time
- **Responsive Design** - Mobile-friendly dengan Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript 5
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Icons**: Lucide React
- **Blockchain**: Alchemy Webhooks
- **Deployment**: Serverless-ready

## 📁 Struktur Proyek

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   │   ├── convert/       # Konversi WLD
│   │   ├── transactions/  # Manajemen transaksi
│   │   └── webhook/       # Alchemy webhooks
│   ├── dashboard/         # Dashboard user
│   ├── admin/            # Dashboard admin
│   ├── login/            # Halaman login
│   ├── register/         # Halaman register
│   └── page.tsx          # Frontpage
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── firebase.ts       # Firebase config
│   └── auth.ts           # Auth helpers
└── middleware.ts         # Route protection
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup Firebase**
   - Buat project di Firebase Console
   - Enable Authentication (Email & Google)
   - Setup Firestore Database
   - Copy config ke `src/lib/firebase.ts`

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build untuk production**
   ```bash
   npm run build
   ```

## 🔧 Konfigurasi

### Firebase Setup
1. Enable Authentication Methods:
   - Email/Password
   - Google Provider

2. Firestore Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /transactions/{transactionId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Alchemy Webhook Setup
1. Buat Alchemy account
2. Setup webhook endpoint: `https://yourdomain.com/api/webhook/alchemy`
3. Subscribe ke events:
   - MINED_TRANSACTION
   - DROPPED_TRANSACTION
   - ADDRESS_ACTIVITY

## 📱 API Endpoints

### Konversi
- `POST /api/convert` - Buat transaksi konversi
- `GET /api/convert` - Get kurs terbaru

### Transaksi
- `GET /api/transactions` - Get riwayat transaksi
- `POST /api/transactions` - Buat transaksi baru
- `PATCH /api/transactions?id={txId}` - Update status transaksi

### Webhook
- `POST /api/webhook/alchemy` - Terima webhook dari Alchemy

## 🔐 Keamanan

- **Authentication**: Firebase Auth dengan token verification
- **Authorization**: Role-based access control (User/Admin)
- **Input Validation**: Server-side validation untuk semua input
- **Rate Limiting**: Implementasi rate limiting di API routes
- **CORS**: Proper CORS configuration
- **Webhook Security**: Signature verification untuk Alchemy webhooks

## 🎨 UI/UX

- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Menggunakan next-themes
- **Loading States**: Skeleton dan spinners
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML dan ARIA support

## 📊 Monitoring

### Metrics yang di-track:
- User registration dan login
- Transaction volume dan success rate
- Conversion rate
- System performance
- Error rates

### Logging:
- Structured logging dengan timestamps
- Error tracking
- Transaction audit trail

## 🚀 Deployment

### Vercel (Recommended)
1. Connect repo ke Vercel
2. Setup environment variables
3. Deploy dengan `vercel --prod`

### Manual Deployment
1. Build aplikasi: `npm run build`
2. Start production server: `npm start`

## 🤝 Contributing

1. Fork repository
2. Buat feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push ke branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file untuk details

## 🆘 Support

Untuk support atau questions:
- Email: support@wldconverter.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Built with ❤️ using Next.js 15 and Firebase**