export type Song = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  audioUrl?: string; // Optional/ignored for YouTube IFrame
};

export interface Playlist {
  id: string;
  name: string;
  tracks: Song[];
  createdAt: number;
  isCurated?: boolean;
}

