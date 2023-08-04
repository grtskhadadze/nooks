import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Socket } from "socket.io-client";

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
  const player = useRef<ReactPlayer>(null);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleEnd = () => {
    console.log("Video ended");
  };

  const handleSeek = (seconds: number) => {
    // Ideally, the seek event would be fired whenever the user moves the built in Youtube video slider to a new timestamp.
    // However, the youtube API no longer supports seek events (https://github.com/cookpete/react-player/issues/356), so this no longer works

    // You'll need to find a different way to detect seeks (or just write your own seek slider and replace the built in Youtube one.)
    // Note that when you move the slider, you still get play, pause, buffer, and progress events, can you use those?

    console.log(
      "This never prints because seek decetion doesn't work: ",
      seconds
    );
  };

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
    console.log("Video progress: ", state);
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

    return () => {
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
    };
  }, [socket]);

  console.log(isPlaying);

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
        flexDirection="column"
      >
        <ReactPlayer
          ref={player}
          url={url}
          playing={hasJoined && isPlaying}
          controls={!hideControls}
          onReady={handleReady}
          onEnded={handleEnd}
          onSeek={handleSeek}
          onPlay={handlePlay}
          onPause={handlePause}
          onBuffer={handleBuffer}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ pointerEvents: hideControls ? "none" : "auto" }}
        />
      </Box>
      {!hasJoined && isReady && (
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={() => setHasJoined(true)}
        >
          Start Watching
        </Button>
      )}
    </Box>
  );
};

export default VideoPlayer;
