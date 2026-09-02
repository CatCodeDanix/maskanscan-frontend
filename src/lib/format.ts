import type { UnifiedListing } from "@/types/listing";

// ── Persian Digit Converter ───────────────────────────────────────────────────

/** Convert any string or number containing ASCII digits (0-9) to Persian digits (۰-۹) */
export function toPersianDigits(
	input: number | string | undefined | null,
): string {
	if (input === undefined || input === null) return "";
	const str = String(input);
	const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
	return str.replace(
		/[0-9]/g,
		(w) => persianDigits[englishDigits.indexOf(w)] ?? w,
	);
}

// ── Toman formatter ─────────────────────────────────────────────────────────────

/** Format a Toman amount with Persian-locale separators and Persian digits */
export function formatToman(amount: number | undefined | null): string {
	if (amount === undefined || amount === null || amount === 0) return "—";

	const absAmount = Math.abs(amount);

	if (absAmount >= 1_000_000_000) {
		const billions = absAmount / 1_000_000_000;
		const rounded = Number.isInteger(billions)
			? toPersianDigits(billions.toLocaleString())
			: toPersianDigits(billions.toFixed(1));
		return `${rounded} میلیارد تومان`;
	}

	if (absAmount >= 1_000_000) {
		const millions = absAmount / 1_000_000;
		const rounded = Number.isInteger(millions)
			? toPersianDigits(millions.toLocaleString())
			: toPersianDigits(millions.toFixed(1));
		return `${rounded} میلیون تومان`;
	}

	return `${toPersianDigits(absAmount.toLocaleString())} تومان`;
}

/** Format a listing's primary price string */
export function formatListingPrice(listing: UnifiedListing): string {
	if (listing.dealType === "rent") {
		const deposit = listing.isAgreedDeposit
			? "توافقی"
			: formatToman(listing.depositTomans);
		const rent = listing.isAgreedRent
			? "توافقی"
			: formatToman(listing.rentTomans);

		if (
			(listing.isAgreedDeposit || !listing.depositTomans) &&
			(listing.isAgreedRent || !listing.rentTomans)
		) {
			return "توافقی";
		}
		if (!listing.rentTomans && listing.depositTomans)
			return `رهن کامل: ${deposit}`;
		if (!listing.depositTomans && listing.rentTomans) return `اجاره: ${rent}`;
		return `رهن: ${deposit} • اجاره: ${rent}`;
	}

	// Buy
	if (listing.isAgreedPrice) return "توافقی";
	return formatToman(listing.totalPriceTomans);
}

/** Short price for card thumbnails */
export function formatListingPriceShort(listing: UnifiedListing): string {
	if (listing.dealType === "rent") {
		if (listing.isAgreedRent && listing.isAgreedDeposit) return "توافقی";
		const dep = listing.isAgreedDeposit
			? "رهن توافقی"
			: listing.depositTomans
				? `رهن ${formatToman(listing.depositTomans)}`
				: "";
		const rent = listing.isAgreedRent
			? "اجاره توافقی"
			: listing.rentTomans
				? `اجاره ${formatToman(listing.rentTomans)}`
				: "";

		if (dep && rent) return `${dep} • ${rent}`;
		if (dep) return dep;
		if (rent) return rent;
		return "توافقی";
	}
	if (listing.isAgreedPrice) return "توافقی";
	return formatToman(listing.totalPriceTomans);
}

// ── Source helpers ───────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
	divar: "دیوار",
	sheypoor: "شیپور",
	kilid: "کلید",
	mrestate: "مستر ملک",
};

const SOURCE_COLORS: Record<string, string> = {
	divar: "bg-red-600 text-white shadow-xs",
	sheypoor: "bg-blue-600 text-white shadow-xs",
	kilid: "bg-violet-600 text-white shadow-xs",
	mrestate: "bg-emerald-600 text-white shadow-xs",
};

export function getSourceLabel(source: string): string {
	return SOURCE_LABELS[source] ?? source;
}

export function getSourceColor(source: string): string {
	return SOURCE_COLORS[source] ?? "bg-muted text-muted-foreground";
}

// ── Date helpers ────────────────────────────────────────────────────────────────

export function formatRelativeDate(isoDate: string | undefined): string {
	if (!isoDate) return "";
	const date = new Date(isoDate);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "امروز";
	if (diffDays === 1) return "دیروز";
	if (diffDays < 7) return `${toPersianDigits(diffDays)} روز پیش`;
	if (diffDays < 30)
		return `${toPersianDigits(Math.floor(diffDays / 7))} هفته پیش`;
	if (diffDays < 365)
		return `${toPersianDigits(Math.floor(diffDays / 30))} ماه پیش`;
	return `${toPersianDigits(Math.floor(diffDays / 365))} سال پیش`;
}

// ── Number helpers ───────────────────────────────────────────────────────────────

export function formatBedrooms(n: number | undefined): string {
	if (n === undefined || n === null) return "";
	if (n === 0) return "استودیو";
	return `${toPersianDigits(n)} خوابه`;
}
