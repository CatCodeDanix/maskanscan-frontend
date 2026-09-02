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
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "https://maskanscan.ir",
	),
	title: {
		default: "مسکن اسکن - جستجوی هوشمند رهن و اجاره تهران روی نقشه",
		template: "%s | مسکن اسکن",
	},
	description:
		"سامانه یکپارچه پایش، مقایسه و جستجوی هوشمند آگهی‌های رهن و اجاره مسکونی تهران. تجمیع آگهی‌های دیوار، شیپور، کلید و مستر ملک روی نقشه تعاملی با محاسبه‌گر رهن و اجاره.",
	keywords: [
		"مسکن اسکن",
		"MaskanScan",
		"اجاره خانه تهران",
		"رهن و اجاره آپارتمان تهران",
		"نقشه املاک تهران",
		"تجمیع آگهی املاک",
		"محاسبه تبدیل رهن و اجاره",
		"آگهی دیوار و شیپور املاک",
		"اجاره مسکونی تهران",
	],
	authors: [{ name: "Danial Abdoli" }],
	creator: "Danial Abdoli",
	publisher: "مسکن اسکن",
	alternates: {
		canonical: "/",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/logo.svg", type: "image/svg+xml" },
		],
		apple: [{ url: "/logo.svg" }],
	},
	openGraph: {
		type: "website",
		locale: "fa_IR",
		siteName: "مسکن اسکن | MaskanScan",
		title: "مسکن اسکن - جستجوی هوشمند رهن و اجاره تهران روی نقشه",
		description:
			"سامانه یکپارچه پایش، مقایسه و جستجوی هوشمند آگهی‌های رهن و اجاره مسکونی در تهران از معتبرترین پلتفرم‌ها روی نقشه تعاملی.",
		url: "https://maskanscan.ir",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "مسکن اسکن - جستجوی هوشمند رهن و اجاره تهران",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "مسکن اسکن - جستجوی هوشمند رهن و اجاره تهران روی نقشه",
		description:
			"سامانه یکپارچه پایش و مقایسه آگهی‌های رهن و اجاره مسکونی در تهران روی نقشه تعاملی.",
		images: ["/og-image.jpg"],
		creator: "@maskanscan",
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
};

const jsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "WebSite",
			"@id": "https://maskanscan.ir/#website",
			url: "https://maskanscan.ir",
			name: "مسکن اسکن | MaskanScan",
			description:
				"سامانه یکپارچه پایش، مقایسه و جستجوی هوشمند آگهی‌های رهن و اجاره مسکونی در تهران",
			inLanguage: "fa-IR",
			potentialAction: {
				"@type": "SearchAction",
				target: "https://maskanscan.ir/explore?query={search_term_string}",
				"query-input": "required name=search_term_string",
			},
		},
		{
			"@type": "SoftwareApplication",
			"@id": "https://maskanscan.ir/#application",
			name: "مسکن اسکن",
			operatingSystem: "Web",
			applicationCategory: "RealEstateApplication",
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "IRR",
			},
		},
	],
};

import { Toaster } from "@/components/ui/sonner";

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
			<head>
				<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			</head>
			<body className="flex min-h-dvh flex-col">
				<ThemeProvider
					storage="cookie"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<DirectionProvider dir="rtl" direction="rtl">
						<Providers>
							{children}
							<Toaster />
						</Providers>
					</DirectionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
