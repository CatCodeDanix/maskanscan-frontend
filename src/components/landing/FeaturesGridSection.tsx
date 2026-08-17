"use client";

import {
	BellRing,
	CheckCheck,
	Filter,
	History,
	Sparkles,
	Train,
	UploadCloud,
} from "lucide-react";

const FEATURES = [
	{
		title: "اعلان فوری آگهی‌های زیرقیمت",
		desc: "جستجوی مدنظر خود را ذخیره کنید تا به محض ثبت فایل جدید و مناسب در دیوار یا شیپور، از طریق ربات تلگرام یا پیامک باخبر شوید.",
		icon: BellRing,
		badge: "صرفه‌جویی در زمان",
	},
	{
		title: "حذف ۱۰۰٪ فایل‌های تکراری",
		desc: "هنگامی که چندین مشاور یک واحد مشترک را در پلتفرم‌های مختلف آگهی می‌کنند، مسکن‌اسکن آنها را در یک کارت واحد ادغام می‌نماید.",
		icon: CheckCheck,
		badge: "بدون آگهی فیک",
	},
	{
		title: "ثبت مستقیم ملک توسط مالک",
		desc: "مالکان تهرانی می‌توانند بدون واسطه و با ثبت مشخصات، خانه خود را در معرض دید هزاران متقاضی رهن و اجاره قرار دهند.",
		icon: UploadCloud,
		badge: "ویژه مالکان",
	},
	{
		title: "فیلترهای عمیق و کاربردی",
		desc: "تفکیک دقیق امکانات حیاتی مثل آسانسور، پارکینگ، انباری، بالکن، سال ساخت، نوع ملک و قابلیت تبدیل ودیعه.",
		icon: Filter,
		badge: "دقت بالا",
	},
	{
		title: "پایش سابقه و روند قیمت محلات",
		desc: "مشاهده میانگین قیمت متری رهن و اجاره در محله‌های مختلف تهران برای تصمیم‌گیری آگاهانه و اجتناب از قیمت‌های حباب‌دار.",
		icon: History,
		badge: "تحلیل بازار",
	},
	{
		title: "شاخص دسترسی به مترو و BRT",
		desc: "محاسبه خودکار فاصله پیاده‌روی هر ملک تا نزدیک‌ترین ایستگاه‌های خطوط مترو و اتوبوس‌های تندرو تهران.",
		icon: Train,
		badge: "حمل و نقل شهری",
	},
];

export function FeaturesGridSection() {
	return (
		<section
			id="features"
			className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md"
			dir="rtl"
		>
			<div className="max-w-7xl mx-auto space-y-16">
				{/* Section Header */}
				<div className="max-w-3xl mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
						<Sparkles className="size-3" />
						<span>امکانات انحصاری برای متقاضیان و مالکان</span>
					</div>
					<h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-[1.45] sm:leading-[1.4] py-1">
						طراحی‌شده برای واقعیت‌های
						<br />
						<span className="text-primary">
							بازار مسکن و اجاره‌نشینی در تهران
						</span>
					</h2>
					<p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-[1.8]">
						هر ابزار، فیلتر و شاخص در مسکن‌اسکن بر اساس نیازهای واقعی مستأجران و
						مالکان تهرانی توسعه یافته است.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{FEATURES.map((f) => (
						<div
							key={f.title}
							className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group"
						>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
										<f.icon className="size-6" />
									</div>
									<span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
										{f.badge}
									</span>
								</div>

								<h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
									{f.title}
								</h3>

								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
									{f.desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
