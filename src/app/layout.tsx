import { DirectionProvider } from "@/components/ui/direction";
import { ThemeProvider } from "@wrksz/themes/next";
import type { Metadata } from "next";
import "@/styles/globals.css";

// TODO: Add custom local fonts

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
      className={`h-full antialiased`}
      suppressHydrationWarning
    >
      <ThemeProvider
        storage="cookie"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <DirectionProvider dir="rtl">
          <body className="flex min-h-full flex-col">{children}</body>
        </DirectionProvider>
      </ThemeProvider>
    </html>
  );
}
