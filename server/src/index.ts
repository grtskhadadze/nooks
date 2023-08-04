import express from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { Session } from "../../shared/Types";

const PORT = 5000;

// Express server setup
const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const options = {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
};
const io = new Server(httpServer, options);

let sessions: Session[] = [];

io.on("connection", (socket: Socket) => {
  console.log("New client connected", socket.id);

  socket.on("join", (sessionId: string) => {
    // Add the client to the session
    socket.join(sessionId);
    console.log(`User joined session: ${sessionId}`);
  });

  socket.on("leave", (sessionId: string) => {
    socket.leave(sessionId);
    console.log(`User left session: ${sessionId}`);
  });

  socket.on("userPlay", (sessionId: string, timestamp: number) => {
    // Triggered when a user hits play
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      // Update the video state
      session.videoState = {
        ...session.videoState,
        isPlaying: true,
        progress: timestamp,
      };
      // This sends the updated video state to all clients in the session except the sender
      socket.to(sessionId).emit("play", timestamp);
      // Send to the sender too. This is done for better synchronicity
      socket.emit("play", timestamp);
    }
  });

  socket.on("userPause", (sessionId: string, timestamp: number) => {
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      session.videoState = {
        ...session.videoState,
        isPlaying: false,
        progress: timestamp,
      };
      socket.to(sessionId).emit("pause", timestamp);
      socket.emit("pause", timestamp);
    }
  });

  socket.on("userSeek", (sessionId: string, timestamp: number) => {
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      session.videoState = { ...session.videoState, progress: timestamp };
      socket.to(sessionId).emit("seek", timestamp);
      socket.emit("seek", timestamp);
    }
  });

  socket.on("progress", (sessionId: string, progress: number) => {
    // This is unnecessary but it's better to keep the video state in sync for future use
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      session.videoState = { ...session.videoState, progress };
    }
  });

  socket.on("startWatching", (sessionId: string) => {
    // This is for latecomers. When a user joins a session, sync is triggered.
    // On sync the existing viewers will send out a seek event with their timestamp
    const session = sessions.find((session) => session.id === sessionId);
    if (session) {
      socket.to(sessionId).emit("sync");
    }
  });
});

// REST endpoints
app.get("/sessions", (_, res) => {
  // get all sessions for the list. Easier access to rooms
  res.json(sessions);
});

app.post("/create", (req, res) => {
  const videoUrl = req.body.videoUrl;
  const sessionName = req.body.name;
  const sessionId = uuidv4();
  const session: Session = {
    id: sessionId,
    name: String(sessionName),
    videoUrl: String(videoUrl),
    videoState: { isPlaying: false, progress: 0 },
  };
  sessions.push(session);
  res.status(201).send({ sessionId });
});

app.get("/watch/:id", (req, res) => {
  console.log(req.params.id);
  const session = sessions.find((session) => session.id === req.params.id);
  if (session) {
    res.status(200).json(session);
  } else {
    res.status(404).send({ message: "Session not found" });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
