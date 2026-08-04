const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000";

export async function GET() {
	try {
		const res = await fetch(`${BACKEND_URL}/api/locations/tree`, {
			// Cache for 24 hours — location data rarely changes
			next: { revalidate: 86400 },
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
