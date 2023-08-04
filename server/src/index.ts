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
  videoUrl: string;
  videoState: VideoState;
}

let sessions: Session[] = [];

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  socket.on("create", (videoUrl: string) => {
    const sessionId = uuidv4();

    // Create a new session with initial video state
    const newSession: Session = {
      id: sessionId,
      videoUrl: videoUrl,
      videoState: {
        isPlaying: false,
        progress: 0,
        timestamp: new Date(),
      },
    };

    // Add the new session to the list of sessions
    sessions.push(newSession);

    // Send the ID of the new session back to the client
    socket.emit("sessionId", sessionId);
  });

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

httpServer.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
