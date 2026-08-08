import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: ["192.168.43.180", "192.168.1.103"],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**" },
			{ protocol: "http", hostname: "**" },
		],
	},
};

export default nextConfig;
