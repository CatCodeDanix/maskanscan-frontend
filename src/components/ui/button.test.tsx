import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button component", () => {
	it("renders button with text content", () => {
		render(<Button>کلیک کنید</Button>);
		const btn = screen.getByRole("button", { name: "کلیک کنید" });
		expect(btn).toBeInTheDocument();
	});

	it("handles user click events", async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>ارسال</Button>);
		const btn = screen.getByRole("button", { name: "ارسال" });

		await user.click(btn);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("disables button when disabled prop is provided", async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Button disabled onClick={handleClick}>
				غیرفعال
			</Button>,
		);
		const btn = screen.getByRole("button", { name: "غیرفعال" });
		expect(btn).toBeDisabled();

		await user.click(btn);
		expect(handleClick).not.toHaveBeenCalled();
	});
});
