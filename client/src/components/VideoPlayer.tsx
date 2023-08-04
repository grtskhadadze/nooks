import { Box, Button } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Socket } from "socket.io-client";
import VideoOverlay from "./VideoOverlay";

interface VideoPlayerProps {
  url: string;
  hideControls?: boolean;
  socket: Socket;
  sessionId?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  hideControls,
  socket,
  sessionId,
}) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const player = useRef<ReactPlayer>(null);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleEnd = () => {
    console.log("Video ended");
  };

  const handleSeek = useCallback(
    (timestamp: number) => {
      console.log("User sought to: ", timestamp);
      socket.emit("userSeek", sessionId, timestamp);
    },
    [sessionId, socket]
  );

  const handlePlay = () => {
    const time = player.current?.getCurrentTime();
    console.log("User played video at time: ", time);
    socket.emit("userPlay", sessionId, time);
  };

  const handlePause = () => {
    const time = player.current?.getCurrentTime();
    console.log("User paused video at time: ", time);
    socket.emit("userPause", sessionId, time);
  };

  const handleBuffer = () => {
    console.log("Video buffered");
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    // console.log("Video progress: ", state);
    setProgress(state.playedSeconds);
    socket.emit("progress", sessionId, state.playedSeconds);
  };

  useEffect(() => {
    socket.on("play", (time: number) => {
      console.log("Playing video at time: ", time);
      player.current?.seekTo(time);
      setIsPlaying(true);
    });

    socket.on("pause", (time: number) => {
      console.log("Pausing video at time: ", time);
      player.current?.seekTo(time);
      setIsPlaying(false);
    });

    socket.on("seek", (time: number) => {
      console.log("Seeking video to time: ", time);
      player.current?.seekTo(time);
    });

    socket.on("sync", () => {
      handleSeek(player.current?.getCurrentTime() || 0);
    });

    return () => {
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("sync");
    };
  }, [socket, handleSeek]);

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        width="100%"
        height="100%"
        display={hasJoined ? "flex" : "none"}
        position={"relative"}
      >
        <ReactPlayer
          ref={player}
          url={url}
          playing={hasJoined && isPlaying}
          controls={!hideControls}
          onReady={handleReady}
          onEnded={handleEnd}
          onSeek={handleSeek}
          onBuffer={handleBuffer}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ pointerEvents: hideControls ? "none" : "auto" }}
        />
        <VideoOverlay
          playing={isPlaying}
          setPlaying={setIsPlaying}
          progress={progress}
          setProgress={setProgress}
          onPause={handlePause}
          onPlay={handlePlay}
          onSeek={handleSeek}
          videoLength={player.current?.getDuration() || 0}
        />
      </Box>
      {!hasJoined && isReady && (
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            socket.emit("startWatching", sessionId);
            setHasJoined(true);
            setIsPlaying(true);
          }}
        >
          Start Watching
        </Button>
      )}
    </Box>
  );
};

export default VideoPlayer;
