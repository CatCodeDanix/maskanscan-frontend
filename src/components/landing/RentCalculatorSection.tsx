"use client";

import { ArrowLeft, Calculator, Coins, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatToman, toPersianDigits } from "@/lib/format";

export function RentCalculatorSection() {
	// Base Inputs in Tomans (default: 500 million deposit, 15 million rent)
	const [depositMillion, setDepositMillion] = useState<number>(500);
	const [rentMillion, setRentMillion] = useState<number>(15);
	const [monthlyRatePercent, setMonthlyRatePercent] = useState<number>(3.0); // 3% per month is Tehran market norm (30,000 Toman per 1 Million)

	// Calculations
	// 100 Million Deposit = (100 * (Rate / 100)) Million Rent
	const results = useMemo(() => {
		const rateRatio = monthlyRatePercent / 100;
		// Full Deposit Equivalent (رهن کامل معادل) = Deposit + (Rent / rateRatio)
		const fullEquivalentDepositMillion =
			depositMillion + (rateRatio > 0 ? rentMillion / rateRatio : 0);

		// Full Monthly Rent Equivalent (اجاره کامل بدون ودیعه) = Rent + (Deposit * rateRatio)
		const fullEquivalentRentMillion = rentMillion + depositMillion * rateRatio;

		// Converted scenarios
		// Scenario A: Higher deposit (+200m deposit -> less rent)
		const scenarioA_deposit = Math.max(0, depositMillion + 200);
		const scenarioA_rent = Math.max(0, rentMillion - 200 * rateRatio);

		// Scenario B: Lower deposit (-200m deposit -> more rent)
		const scenarioB_deposit = Math.max(0, depositMillion - 200);
		const scenarioB_rent = rentMillion + 200 * rateRatio;

		return {
			fullDepositTomans: fullEquivalentDepositMillion * 1_000_000,
			fullRentTomans: fullEquivalentRentMillion * 1_000_000,
			scenarioA: {
				depositTomans: scenarioA_deposit * 1_000_000,
				rentTomans: scenarioA_rent * 1_000_000,
			},
			scenarioB: {
				depositTomans: scenarioB_deposit * 1_000_000,
				rentTomans: scenarioB_rent * 1_000_000,
			},
		};
	}, [depositMillion, rentMillion, monthlyRatePercent]);

	return (
		<section
			id="calculator"
			className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background/60 backdrop-blur-md"
			dir="rtl"
		>
			<div className="max-w-7xl mx-auto space-y-16">
				{/* Section Header */}
				<div className="max-w-3xl mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
						<Calculator className="size-3" />
						<span>ماشین‌حساب هوشمند تهران</span>
					</div>
					<h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-[1.45] sm:leading-[1.4] py-1">
						فرمول تبدیل رهن و اجاره،
						<br />
						<span className="text-primary">دقیق، شفاف و بر اساس بودجه شما</span>
					</h2>
					<p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-[1.8]">
						در بازار اجاره تهران عرف تبدیل هر ۱۰۰ میلیون تومان ودیعه معادل ۳
						میلیون تومان اجاره ماهانه (نرخ ۳ درصد) است. با این ابزار می‌توانید
						بودجه خود را به حالت‌های مختلف رهن و اجاره تبدیل کنید.
					</p>
				</div>

				{/* Interactive Calculator Widget */}
				<div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl">
					{/* Left Col: Inputs */}
					<div className="lg:col-span-6 space-y-5 border-b lg:border-b-0 lg:border-l border-border/70 pb-6 lg:pb-0 lg:pl-6">
						<div className="flex items-center justify-between">
							<span className="font-bold text-sm text-foreground flex items-center gap-2">
								<Coins className="size-4 text-primary" />
								<span>مبلغ رهن و اجاره فعلی یا پیشنهادی:</span>
							</span>
							<button
								type="button"
								onClick={() => {
									setDepositMillion(500);
									setRentMillion(15);
									setMonthlyRatePercent(3.0);
								}}
								className="text-xs text-primary hover:underline flex items-center gap-1"
							>
								<RefreshCw className="size-3" />
								<span>بازنشانی</span>
							</button>
						</div>

						{/* Deposit Input */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between text-xs">
								<span className="font-semibold text-foreground">
									ودیعه (رهن):
								</span>
								<span className="font-bold text-primary">
									{formatToman(depositMillion * 1_000_000)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="number"
									min={0}
									step={10}
									value={depositMillion}
									onChange={(e) =>
										setDepositMillion(Math.max(0, Number(e.target.value) || 0))
									}
									className="h-10 text-sm font-semibold"
									dir="ltr"
								/>
								<span className="text-xs text-muted-foreground shrink-0">
									میلیون تومان
								</span>
							</div>
						</div>

						{/* Rent Input */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between text-xs">
								<span className="font-semibold text-foreground">
									اجاره ماهانه:
								</span>
								<span className="font-bold text-primary">
									{formatToman(rentMillion * 1_000_000)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="number"
									min={0}
									step={1}
									value={rentMillion}
									onChange={(e) =>
										setRentMillion(Math.max(0, Number(e.target.value) || 0))
									}
									className="h-10 text-sm font-semibold"
									dir="ltr"
								/>
								<span className="text-xs text-muted-foreground shrink-0">
									میلیون تومان
								</span>
							</div>
						</div>

						{/* Rate Selector */}
						<div className="space-y-2 pt-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">نرخ تبدیل ماهانه:</span>
								<span className="font-bold text-foreground">
									{toPersianDigits(monthlyRatePercent)}٪ (
									{toPersianDigits(monthlyRatePercent * 10)} هزار تومان به ازای
									هر ۱ میلیون)
								</span>
							</div>
							<div className="grid grid-cols-3 gap-2">
								{[2.5, 3.0, 3.5].map((rate) => (
									<button
										key={rate}
										type="button"
										onClick={() => setMonthlyRatePercent(rate)}
										className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
											monthlyRatePercent === rate
												? "bg-primary text-primary-foreground border-primary shadow-xs"
												: "bg-muted text-muted-foreground border-border hover:bg-muted/80"
										}`}
									>
										{toPersianDigits(rate)} درصد {rate === 3.0 ? "(عرف)" : ""}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Right Col: Conversion Summary & Link */}
					<div className="lg:col-span-6 flex flex-col justify-between space-y-5">
						<div className="space-y-3.5">
							<span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
								معادل‌های محاسبه‌شده بودجه شما:
							</span>

							{/* Card A: Full Deposit Equivalent */}
							<div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 space-y-1">
								<span className="text-xs font-semibold text-primary">
									معادل رهن کامل (بدون اجاره):
								</span>
								<div className="text-lg sm:text-xl font-black text-foreground">
									{formatToman(results.fullDepositTomans)}
								</div>
							</div>

							{/* Alternative Scenarios */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
								<div className="p-3 rounded-xl bg-muted/60 border border-border/80 space-y-1">
									<span className="text-muted-foreground text-[11px]">
										با ۲۰۰ میلیون ودیعه بیشتر:
									</span>
									<p className="font-bold text-foreground">
										{formatToman(results.scenarioA.depositTomans)}
									</p>
									<p className="text-primary font-semibold">
										اجاره: {formatToman(results.scenarioA.rentTomans)}
									</p>
								</div>

								<div className="p-3 rounded-xl bg-muted/60 border border-border/80 space-y-1">
									<span className="text-muted-foreground text-[11px]">
										با ۲۰۰ میلیون ودیعه کمتر:
									</span>
									<p className="font-bold text-foreground">
										{formatToman(results.scenarioB.depositTomans)}
									</p>
									<p className="text-primary font-semibold">
										اجاره: {formatToman(results.scenarioB.rentTomans)}
									</p>
								</div>
							</div>
						</div>

						{/* Direct Search Link */}
						<Button
							asChild
							size="lg"
							className="w-full font-bold gap-2 rounded-xl shadow-md"
						>
							<Link
								href={`/explore?minDeposit=${Math.max(0, depositMillion - 100) * 1_000_000}&maxDeposit=${(depositMillion + 100) * 1_000_000}&maxRent=${(rentMillion + 5) * 1_000_000}`}
							>
								<span>مشاهده این بودجه در نسخه دمو</span>
								<ArrowLeft className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
