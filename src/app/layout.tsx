import { ModeToggle } from "@/components/ModeToggle";
import Providers from "@/components/Providers";
import { DirectionProvider } from "@/components/ui/direction";
import "@/styles/globals.css";
import { ThemeProvider } from "@wrksz/themes/next";
import type { Metadata } from "next";
import localFont from "next/font/local";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const iranSansX = localFont({
  src: [
    {
      path: "../assets/fonts/woff2/IRANSansX-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/woff/IRANSansX-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/woff2/IRANSansX-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/woff/IRANSansX-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "مسکن اسکن - جستجوی هوشمند ملک در ایران",
    template: "%s | مسکن اسکن",
  },
  description:
    "پلتفرم یکپارچه جستجوی ملک در ایران. مقایسه آگهی‌های املاک از منابع معتبر، فیلتر پیشرفته، نقشه تعاملی و اعلان‌های هوشمند برای یافتن خانه ایده‌آل شما.",
  keywords: [
    "املاک",
    "مسکن",
    "خرید خانه",
    "اجاره آپارتمان",
    "جستجوی ملک",
    "ایران",
    "نقشه املاک",
    "قیمت مسکن",
    "MaskanScan",
    "مسکن اسکن",
  ],
  authors: [{ name: "Danial Abdoli" }],
  creator: "Danial Abdoli",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "مسکن اسکن | MaskanScan",
    title: "مسکن اسکن - جستجوی هوشمند ملک در ایران",
    description:
      "پلتفرم یکپارچه جستجوی ملک در ایران. مقایسه آگهی‌های املاک از منابع معتبر با نقشه تعاملی و فیلترهای پیشرفته.",
    // url: "https://maskanscan.ir",
    // images: [{ url: "https://maskanscan.ir/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "مسکن اسکن | MaskanScan",
    description:
      "پلتفرم یکپارچه جستجوی ملک در ایران. مقایسه آگهی‌های املاک از منابع معتبر با نقشه تعاملی.",
    // images: ["https://maskanscan.ir/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`
        antialiased
        ${iranSansX.variable}
      `}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider
          storage="cookie"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DirectionProvider dir="rtl" direction="rtl">
            <Providers>
              <div className="fixed top-4 left-4 z-50">
                <ModeToggle />
              </div>
              {children}
            </Providers>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
