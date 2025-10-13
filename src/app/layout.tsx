// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider } from "@/components/theme-provider";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "WLD Converter",
//   description: "Platform terpercaya untuk konversi Worldcoin ke Rupiah.",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <>
//       <html lang="en" suppressHydrationWarning>
//         <head />
//         <body>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             {children}
//           </ThemeProvider>
//         </body>
//       </html>
//     </>
//   );
// }

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "WLD Converter - Tukar Worldcoin ke Rupiah",
    template: "%s | WLD Converter",
  },
  description:
    "Platform terpercaya untuk konversi Worldcoin (WLD) ke Rupiah dengan kurs real-time. Proses cepat, aman, dan transparan. Daftar sekarang dan mulai konversi Worldcoin Anda!",
  keywords: [
    "Worldcoin",
    "WLD",
    "WLD ke Rupiah",
    "Konversi Worldcoin",
    "Jual Worldcoin",
    "Belanja Worldcoin",
    "Kurs Worldcoin",
    "Worldcoin Indonesia",
    "Crypto Indonesia",
    "Konversi Crypto",
  ],
  authors: [{ name: "WLD Converter Team" }],
  creator: "WLD Converter",
  publisher: "WLD Converter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://wldconverter.com"), // Ganti dengan URL domain Anda
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://wldconverter.com", // Ganti dengan URL domain Anda
    title: "WLD Converter - Tukar Worldcoin ke Rupiah",
    description:
      "Platform terpercaya untuk konversi Worldcoin (WLD) ke Rupiah dengan kurs real-time. Proses cepat, aman, dan transparan.",
    siteName: "WLD Converter",
    images: [
      {
        url: "/og-image.jpg", // Ganti dengan path gambar OG Anda
        width: 1200,
        height: 630,
        alt: "WLD Converter - Platform Konversi Worldcoin ke Rupiah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WLD Converter - Tukar Worldcoin ke Rupiah",
    description:
      "Platform terpercaya untuk konversi Worldcoin (WLD) ke Rupiah dengan kurs real-time. Proses cepat, aman, dan transparan.",
    images: ["/og-image.jpg"], // Ganti dengan path gambar OG Anda
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Ganti dengan kode verifikasi Google Anda
    yandex: "your-yandex-verification-code", // Ganti dengan kode verifikasi Yandex Anda
  },
  other: {
    "fb:app_id": "your-facebook-app-id", // Ganti dengan Facebook App ID Anda
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="id" suppressHydrationWarning>
        <head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />

          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "WLD Converter",
                description:
                  "Platform terpercaya untuk konversi Worldcoin (WLD) ke Rupiah dengan kurs real-time",
                url: "https://wldconverter.com",
                applicationCategory: "FinanceApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "IDR",
                },
                provider: {
                  "@type": "Organization",
                  name: "WLD Converter",
                  url: "https://wldconverter.com",
                },
              }),
            }}
          />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
