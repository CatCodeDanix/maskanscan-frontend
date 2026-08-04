import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000";

export async function GET(request: NextRequest) {
	try {
		// Forward all query params to the backend
		const params = request.nextUrl.searchParams.toString();
		const url = `${BACKEND_URL}/api/listings${params ? `?${params}` : ""}`;

		const res = await fetch(url, {
			headers: { "Content-Type": "application/json" },
			// No caching — listings change frequently
			cache: "no-store",
		});

		if (!res.ok) {
			return Response.json(
				{ success: false, error: `Backend responded ${res.status}` },
				{ status: res.status },
			);
		}

		const data = await res.json();
		return Response.json(data);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return Response.json({ success: false, error: message }, { status: 502 });
	}
}
