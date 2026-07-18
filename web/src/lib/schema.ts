import { pgTable, text, boolean, jsonb, bigint, integer, primaryKey } from 'drizzle-orm/pg-core';

export const playlists = pgTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  isCurated: boolean('is_curated').default(false).notNull(),
});

export const songs = pgTable('songs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  channelTitle: text('channel_title').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  duration: integer('duration').notNull(),
  audioUrl: text('audio_url'),
});

export const playlistSongs = pgTable('playlist_songs', {
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  addedAt: bigint('added_at', { mode: 'number' }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.playlistId, t.songId] })
]);

export const apiCache = pgTable('api_cache', {
  key: text('key').primaryKey(),
  data: jsonb('data').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
});
