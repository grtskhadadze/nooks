import React, { useCallback, useEffect } from "react";

interface VideoOverlayProps {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
  videoTitle: string;
  videoLength: number;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  playing,
  setPlaying,
  progress,
  onPlay,
  onPause,
  onSeek,
  videoTitle,
  videoLength,
}) => {
  const handleToggle = useCallback(() => {
    setPlaying(!playing);
    playing ? onPause() : onPlay();
  }, [playing, onPause, onPlay, setPlaying]);

  const handleSpacebar = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space") {
        handleToggle();
      }
    },
    [handleToggle]
  );

  const handleSeek = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(parseFloat(event.target.value));
    },
    [onSeek]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleSpacebar);
    return () => {
      document.removeEventListener("keydown", handleSpacebar);
    };
  }, [playing, handleSpacebar]);

  return (
    <div style={styles.overlay} onClick={handleToggle}>
      <button style={styles.button} onClick={handleToggle}>
        {playing ? "Pause" : "Play"}
      </button>
      <h2 style={styles.title}>{videoTitle}</h2>
      <input
        style={styles.seeker}
        type="range"
        min="0"
        max={videoLength}
        onChange={handleSeek}
      />
      <p style={styles.time}>{videoLength} seconds</p>
    </div>
  );
};

export default VideoOverlay;

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)",
  },
  button: {
    fontSize: "1.5rem",
    color: "#fff",
  },
  title: {
    fontSize: "2rem",
    color: "#fff",
    marginBottom: "1rem",
  },
  seeker: {
    width: "80%",
    margin: "1rem 0",
  },
  time: {
    color: "#fff",
  },
};
