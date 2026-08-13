import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	doublePrecision,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const scrapedListings = pgTable(
	"scraped_listings",
	{
		id: text("id").primaryKey(), // Or serial if integer autoincrement
		source: varchar("source", { length: 50 }).notNull(),
		externalId: varchar("external_id", { length: 255 }).notNull(),
		fingerprintHash: varchar("fingerprint_hash", { length: 64 }),
		url: text("url").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		dealType: varchar("deal_type", { length: 20 }).notNull(),
		city: varchar("city", { length: 100 }).notNull(),
		district: varchar("district", { length: 100 }),
		cityPersian: varchar("city_persian", { length: 100 }).notNull(),
		districtPersian: varchar("district_persian", { length: 100 }),
		depositTomans: bigint("deposit_tomans", { mode: "number" }),
		rentTomans: bigint("rent_tomans", { mode: "number" }),
		equivalentFullDepositTomans: bigint("equivalent_full_deposit_tomans", {
			mode: "number",
		}),
		totalPriceTomans: bigint("total_price_tomans", { mode: "number" }),
		pricePerSqMeterTomans: bigint("price_per_sq_meter_tomans", {
			mode: "number",
		}),
		isAgreedDeposit: boolean("is_agreed_deposit").default(false),
		isAgreedRent: boolean("is_agreed_rent").default(false),
		isAgreedPrice: boolean("is_agreed_price").default(false),
		latitude: doublePrecision("latitude").notNull(),
		longitude: doublePrecision("longitude").notNull(),
		isFuzzy: boolean("is_fuzzy").default(false),
		isFallback: boolean("is_fallback").default(false),
		attributes: jsonb("attributes"),
		images: jsonb("images"),
		publisherType: varchar("publisher_type", { length: 50 }),
		publisherPhone: varchar("publisher_phone", { length: 50 }),
		alternateSources: jsonb("alternate_sources"),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		scrapedAt: timestamp("scraped_at", { withTimezone: true }),
		lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
		ingestionStrategy: varchar("ingestion_strategy", { length: 50 }),
		isActive: boolean("is_active").default(true),
	},
	(table) => [
		index("scraped_listings_city_district_idx").on(table.city, table.district),
		index("scraped_listings_deal_type_idx").on(table.dealType),
		index("scraped_listings_is_active_idx").on(table.isActive),
		index("scraped_listings_spatial_idx").on(table.longitude, table.latitude),
		index("scraped_listings_active_deal_spatial_idx").on(
			table.isActive,
			table.dealType,
			table.longitude,
			table.latitude,
		),
	],
);
