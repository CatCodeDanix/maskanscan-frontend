"use client";

import { useTheme } from "@wrksz/themes/client";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMapStore } from "@/store/map-store";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const setMapTheme = useMapStore((state) => state.setMapTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className="
              size-[1.2rem] scale-100 rotate-0 transition-all
              dark:scale-0 dark:-rotate-90
            "
          />
          <Moon
            className="
              absolute size-[1.2rem] scale-0 rotate-90 transition-all
              dark:scale-100 dark:rotate-0
            "
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setTheme("light");
            setMapTheme("light");
          }}
        >
          روشن
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark");
            setMapTheme("dark");
          }}
        >
          تاریک
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("system");
          }}
        >
          سیستم
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
