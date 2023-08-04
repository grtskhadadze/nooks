import { useCallback, useEffect, useMemo, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import CancelIcon from "@mui/icons-material/Cancel";
import { io } from "socket.io-client";
import { Session } from "../../../shared/types";

const WatchSession: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  const [linkCopied, setLinkCopied] = useState(false);

  const socket = useMemo(() => {
    return io("http://localhost:5000");
  }, []);

  const getSession = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/watch/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) throw new Error("Session not found");

      const data = await response.json();

      setSession(data);
      document.title = data?.name || "Watch Party";

      socket.emit("join", sessionId);
    } catch (err) {
      console.error("Failed to get session:", err);
      navigate("/create");
    }
  }, [sessionId, navigate, socket]);

  useEffect(() => {
    getSession();
  }, [getSession]);

  if (!!session?.videoUrl) {
    return (
      <>
        <Box
          width="100%"
          maxWidth={1000}
          display="flex"
          gap={1}
          marginTop={1}
          alignItems="center"
        >
          <TextField
            label="Youtube URL"
            variant="outlined"
            value={session.videoUrl}
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
            fullWidth
          />
          <Tooltip title={linkCopied ? "Link copied" : "Copy link to share"}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              disabled={linkCopied}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <LinkIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Leave This Watch Party">
            <Button
              onClick={() => {
                socket.emit("leave", sessionId);
                navigate("/create");
              }}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
              color="error"
            >
              <CancelIcon />
            </Button>
          </Tooltip>
        </Box>
        <VideoPlayer
          url={session.videoUrl}
          socket={socket}
          sessionId={sessionId}
          hideControls={true}
        />
      </>
    );
  }

  return null;
};

export default WatchSession;
