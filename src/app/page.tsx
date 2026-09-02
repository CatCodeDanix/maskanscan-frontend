"use client";

import { AggregationSection } from "@/components/landing/AggregationSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FeaturesGridSection } from "@/components/landing/FeaturesGridSection";
import { GeospatialFeatureSection } from "@/components/landing/GeospatialFeatureSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { RentCalculatorSection } from "@/components/landing/RentCalculatorSection";

export default function LandingPage() {
	return (
		<div
			className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary"
			dir="rtl"
		>
			{/* Global Header */}
			<LandingHeader />

			{/* Scrollable Content Layers */}
			<main className="relative flex flex-col">
				{/* 1. Hero Section with Integrated 3D Tehran Canvas */}
				<HeroSection />

				{/* 2. Cross-Platform Aggregation Section */}
				<AggregationSection />

				{/* 3. Geospatial Municipal Boundaries Section */}
				<GeospatialFeatureSection />

				{/* 4. Mortgage-to-Rent Dynamic Calculator */}
				<RentCalculatorSection />

				{/* 5. Key Features Grid */}
				<FeaturesGridSection />

				{/* 6. Launch Map Conversion CTA */}
				<CtaSection />
			</main>

			{/* Global Footer */}
			<LandingFooter />
		</div>
	);
}
