import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  index,
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

export const EVENT_CATEGORIES = [
  "technology",
  "music",
  "food_drink",
  "business",
  "wellness",
  "arts_culture",
  "sports",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export const eventCategoryEnum = pgEnum("event_category", EVENT_CATEGORIES);

export const EVENT_VISIBILITIES = ["public", "private"] as const;
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];
export const eventVisibilityEnum = pgEnum(
  "event_visibility",
  EVENT_VISIBILITIES,
);

export const VIDEO_PLATFORMS = [
  "zoom",
  "google_meet",
  "microsoft_teams",
  "youtube_live",
  "twitch",
  "custom",
] as const;
export type VideoPlatform = (typeof VIDEO_PLATFORMS)[number];
export const videoPlatformEnum = pgEnum("video_platform", VIDEO_PLATFORMS);

export const events = pgTable(
  "event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizerId: text("organizer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: eventCategoryEnum("category").notNull(),
    visibility: eventVisibilityEnum("visibility").default("public").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isOnline: boolean("is_online").default(false).notNull(),
    location: text("location"),
    videoPlatform: videoPlatformEnum("video_platform"),
    eventLink: text("event_link"),
    meetingId: text("meeting_id"),
    passcode: text("passcode"),
    accessInstructions: text("access_instructions"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("event_organizerId_idx").on(table.organizerId)],
);

export const ticketTypes = pgTable(
  "ticket_type",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: numeric("price", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    quantity: integer("quantity"),
    salesEndDate: timestamp("sales_end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("ticketType_eventId_idx").on(table.eventId)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  events: many(events),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  organizer: one(user, {
    fields: [events.organizerId],
    references: [user.id],
  }),
  ticketTypes: many(ticketTypes),
}));

export const ticketTypeRelations = relations(ticketTypes, ({ one }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
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
