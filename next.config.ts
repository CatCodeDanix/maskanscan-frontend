import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: ["192.168.43.180"],
	experimental: {
		useTypeScriptCli: true,
	},
};

export default nextConfig;
