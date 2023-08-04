export interface VideoState {
  isPlaying: boolean;
  progress: number;
}

export interface Session {
  id: string;
  name: string;
  videoUrl: string;
  videoState: VideoState;
}
