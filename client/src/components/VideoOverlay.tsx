import { Box, IconButton, Slider } from "@mui/material";
import React, { useCallback, useEffect } from "react";
import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";

interface VideoOverlayProps {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
  videoLength: number;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  playing,
  setPlaying,
  progress,
  setProgress,
  onPlay,
  onPause,
  onSeek,
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
    (_: Event, value: number | number[], __: number) => {
      setProgress(value as number);
      onSeek(value as number);
    },
    [onSeek, setProgress]
  );

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes / 10 < 1 ? "0" : ""}${minutes}:${
      secs / 10 < 1 ? "0" : ""
    }${secs}`;
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleSpacebar);
    return () => {
      document.removeEventListener("keydown", handleSpacebar);
    };
  }, [playing, handleSpacebar]);
  console.log(progress);

  return (
    <Box style={styles.overlay} onClick={handleToggle}>
      <Slider
        style={styles.seeker}
        min={0}
        max={videoLength}
        onChange={handleSeek}
        value={progress}
        onClick={(event) => event.stopPropagation()}
      />
      <Box style={styles.bottomPanel}>
        <IconButton style={styles.button} onClick={handleToggle}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
        <p style={styles.time}>
          {formatTime(progress)} / {formatTime(videoLength)}
        </p>
      </Box>
    </Box>
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
    justifyContent: "end",
    alignItems: "center",
    background: "linear-gradient(rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.7) 90%",
  },
  bottomPanel: {
    width: "80%",
    display: "flex",
    flexDirection: "row",
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
    marginLeft: "auto",
    color: "#fff",
  },
};
