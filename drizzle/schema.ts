import { pgTable, unique, text, timestamp, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	username: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const rooms = pgTable("rooms", {
	id: text().primaryKey().notNull(),
	password: text(),
	ownerPublicKey: text("owner_public_key").notNull(),
	ownerFingerprint: text("owner_fingerprint").notNull(),
	guestPublicKey: text("guest_public_key"),
	guestFingerprint: text("guest_fingerprint"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const messages = pgTable("messages", {
	id: text().primaryKey().notNull(),
	roomId: text("room_id"),
	sender: text().notNull(),
	content: text().notNull(),
	ts: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "messages_room_id_rooms_id_fk"
		}),
]);
