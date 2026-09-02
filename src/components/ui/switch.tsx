"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
	size?: "sm" | "default";
}) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			data-size={size}
			className={cn(
				`
          peer group/switch
          focus-visible:border-ring focus-visible:ring-ring/50
          aria-invalid:border-destructive aria-invalid:ring-destructive/20
          dark:aria-invalid:border-destructive/50
          dark:aria-invalid:ring-destructive/40
          data-[state=checked]:bg-primary data-checked:bg-primary
          data-[state=unchecked]:bg-input data-unchecked:bg-input
          dark:data-[state=unchecked]:bg-input/80 dark:data-unchecked:bg-input/80
          relative inline-flex shrink-0 items-center rounded-full border
          border-transparent transition-colors outline-none
          focus-visible:ring-2 focus-visible:ring-offset-2
          data-disabled:cursor-not-allowed data-disabled:opacity-50
          data-[size=default]:h-5 data-[size=default]:w-9
          data-[size=sm]:h-4 data-[size=sm]:w-7
        `,
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className="
          bg-background
          dark:bg-white
          pointer-events-none block rounded-full ring-0 shadow-sm transition-transform
          group-data-[size=default]/switch:size-4
          group-data-[size=sm]/switch:size-3
          group-data-[size=default]/switch:data-[state=checked]:translate-x-4
          group-data-[size=default]/switch:rtl:data-[state=checked]:-translate-x-4
          group-data-[size=default]/switch:data-checked:translate-x-4
          group-data-[size=default]/switch:rtl:data-checked:-translate-x-4
          group-data-[size=sm]/switch:data-[state=checked]:translate-x-3
          group-data-[size=sm]/switch:rtl:data-[state=checked]:-translate-x-3
          group-data-[size=sm]/switch:data-checked:translate-x-3
          group-data-[size=sm]/switch:rtl:data-checked:-translate-x-3
          data-[state=unchecked]:translate-x-0.5
          rtl:data-[state=unchecked]:-translate-x-0.5
          data-unchecked:translate-x-0.5
          rtl:data-unchecked:-translate-x-0.5
        "
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
