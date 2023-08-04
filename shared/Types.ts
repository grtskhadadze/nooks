export interface VideoState {
  isPlaying: boolean;
  progress: number;
  timestamp: Date;
}

export interface Session {
  id: string;
  name: string;
  videoUrl: string;
  videoState: VideoState;
}
