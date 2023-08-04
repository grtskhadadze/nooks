import express from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const PORT = 5000;

// Express server setup
const app = express();
app.use(cors());

const httpServer = createServer(app);
const options = {}; // additional options if needed
const io = new Server(httpServer, options);

interface VideoState {
  isPlaying: boolean;
  progress: number;
  timestamp: Date;
}

interface Session {
  id: string;
  name: string;
  videoUrl: string;
  videoState: VideoState;
}

let sessions: Session[] = [];

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  socket.on("join", (sessionId: string) => {
    // Add the client to the session
    socket.join(sessionId);
    console.log(`User joined session: ${sessionId}`);

    // Send the current session state to the newly joined client
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      socket.emit("currentVideoState", session.videoState);
    }
  });

  socket.on("leave", (sessionId: string) => {
    socket.leave(sessionId);
    console.log(`User left session: ${sessionId}`);
  });

  socket.on("videoStateChange", (sessionId: string, videoState: VideoState) => {
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      // Update the video state
      session.videoState = videoState;
      // Send the updated video state to all clients in the session except the sender
      socket.to(sessionId).emit("videoStateChange", videoState);
    }
  });
});

// REST endpoints
app.get("/sessions", (_, res) => {
  res.json(sessions);
});

app.post("/create", (req, res) => {
  const videoUrl = req.query.videoUrl;
  const sessionName = req.query.name;
  const sessionId = uuidv4();
  const session: Session = {
    id: sessionId,
    name: String(sessionName),
    videoUrl: String(videoUrl),
    videoState: { isPlaying: false, progress: 0, timestamp: new Date() },
  };
  sessions.push(session);
  res.status(201).send({ sessionId });
});

app.get("/watch/:id", (req, res) => {
  const session = sessions.find((session) => session.id === req.params.id);
  if (session) {
    res.status(200).send(session);
  } else {
    res.status(404).send({ message: "Session not found" });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
