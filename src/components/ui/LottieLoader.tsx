"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LottieLoaderProps {
	src?: string;
	data?: Record<string, unknown>;
	className?: string;
	size?: number | string;
	loop?: boolean;
	autoplay?: boolean;
	fallbackText?: string;
}

// Popular public dotLottie animations for clean real-estate / search / loading
export const LOTTIE_PRESETS = {
	loading: "https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json",
	building: "https://assets9.lottiefiles.com/packages/lf20_m64xxtu5.json",
	search: "https://assets5.lottiefiles.com/packages/lf20_t9gkkhz4.json",
	empty: "https://assets7.lottiefiles.com/packages/lf20_rc5d0f61.json",
};

export function LottieLoader({
	src = LOTTIE_PRESETS.loading,
	data,
	className,
	size = 64,
	loop = true,
	autoplay = true,
	fallbackText,
}: LottieLoaderProps) {
	const [hasError, setHasError] = useState(false);

	if (hasError) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center gap-2 text-primary",
					className,
				)}
			>
				<Loader2
					className="animate-spin text-primary"
					style={{ width: size, height: size }}
				/>
				{fallbackText && (
					<p className="text-xs text-muted-foreground">{fallbackText}</p>
				)}
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col items-center justify-center", className)}>
			<div style={{ width: size, height: size }}>
				<DotLottieReact
					src={src}
					data={data}
					loop={loop}
					autoplay={autoplay}
					onError={() => setHasError(true)}
				/>
			</div>
			{fallbackText && (
				<p className="mt-2 text-xs text-muted-foreground">{fallbackText}</p>
			)}
		</div>
	);
}
