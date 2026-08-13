import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/mocks/node";
import { getLocationTreeAction } from "./locations";

describe("getLocationTreeAction", () => {
	it("fetches and returns location hierarchy tree successfully via MSW mock", async () => {
		const res = await getLocationTreeAction();

		expect(res.success).toBe(true);
		expect(res.tree).toHaveLength(1);
		expect(res.tree[0].provinceName).toBe("تهران");
		expect(res.tree[0].cities[0].cityName).toBe("تهران");
		expect(res.tree[0].cities[0].districts).toHaveLength(2);
	});

	it("handles backend error responses gracefully", async () => {
		server.use(
			http.get("*/api/locations/tree", () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		const res = await getLocationTreeAction();
		expect(res.success).toBe(false);
		expect(res.tree).toEqual([]);
		expect(res.error).toContain("500");
	});
});
