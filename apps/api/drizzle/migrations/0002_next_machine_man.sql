CREATE TYPE "public"."event_category" AS ENUM('technology', 'music', 'food_drink', 'business', 'wellness', 'arts_culture', 'sports');--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."video_platform" AS ENUM('zoom', 'google_meet', 'microsoft_teams', 'youtube_live', 'twitch', 'custom');--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"organizer_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "event_category" NOT NULL,
	"visibility" "event_visibility" DEFAULT 'public' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"location" text,
	"video_platform" "video_platform",
	"event_link" text,
	"meeting_id" text,
	"passcode" text,
	"access_instructions" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_type" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"quantity" integer,
	"sales_end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_organizer_id_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_type" ADD CONSTRAINT "ticket_type_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_organizerId_idx" ON "event" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "ticketType_eventId_idx" ON "ticket_type" USING btree ("event_id");