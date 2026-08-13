import { HttpResponse, http } from "msw";

export const handlers = [
	// Mock backend locations tree endpoint
	http.get("*/api/locations/tree", () => {
		return HttpResponse.json({
			success: true,
			tree: [
				{
					provinceId: "tehran-province",
					provinceName: "تهران",
					cities: [
						{
							cityId: "tehran",
							cityName: "تهران",
							districts: [
								{
									districtId: "saadat-abad",
									districtName: "سعادت آباد",
									cityId: "tehran",
								},
								{
									districtId: "shahrak-gharb",
									districtName: "شهرک غرب",
									cityId: "tehran",
								},
							],
						},
					],
				},
			],
		});
	}),
];
