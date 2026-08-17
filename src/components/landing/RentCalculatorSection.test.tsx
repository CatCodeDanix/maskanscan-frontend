import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RentCalculatorSection } from "./RentCalculatorSection";

describe("RentCalculatorSection", () => {
	it("renders calculator title and default deposit/rent values", () => {
		render(<RentCalculatorSection />);

		expect(screen.getByText(/فرمول تبدیل رهن و اجاره/i)).toBeInTheDocument();

		expect(screen.getByText(/۵۰۰ میلیون تومان/i)).toBeInTheDocument();
		expect(screen.getByText(/۱۵ میلیون تومان/i)).toBeInTheDocument();
	});

	it("calculates full deposit equivalent with 3 percent rate", () => {
		render(<RentCalculatorSection />);

		// Default 500m deposit + 15m rent (with 3% rate: 15 / 0.03 = 500m equivalent) -> 1 Billion total deposit
		expect(screen.getByText(/معادل رهن کامل/i)).toBeInTheDocument();
		expect(screen.getByText(/۱ میلیارد تومان/i)).toBeInTheDocument();
	});

	it("updates calculations when user changes monthly rate to 2.5%", async () => {
		const user = userEvent.setup();
		render(<RentCalculatorSection />);

		const rateButton = screen.getByRole("button", { name: /۲.۵ درصد/i });
		await user.click(rateButton);

		// With 2.5% rate: 15 / 0.025 = 600m equivalent -> 1.1 Billion total deposit
		expect(screen.getByText(/۱.۱ میلیارد تومان/i)).toBeInTheDocument();
	});
});
