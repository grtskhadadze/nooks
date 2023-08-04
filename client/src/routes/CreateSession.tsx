import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHead,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Session } from "../../../shared/types";

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);

  const createSession = useCallback(async () => {
    setNewUrl("");
    try {
      // Create a new session with a POST request
      const response = await fetch("http://localhost:5000/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName, videoUrl: newUrl }),
      });

      const data = await response.json();

      // Redirect to the watch page for the newly created session
      navigate(`/watch/${data.sessionId}`);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, [navigate, newName, newUrl]);

  const getSessions = useCallback(async () => {
    try {
      // Get all active sessions with a GET request
      const response = await fetch("http://localhost:5000/sessions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(data);

      setSessions(data);
    } catch (err) {
      console.error("Failed to get sessions:", err);
    }
  }, []);

  useEffect(() => {
    getSessions();
    // retitle when leaving session
    document.title = "Youtube Watch Party";
  }, [getSessions]);

  return (
    <Box
      width="100%"
      minWidth={500}
      maxWidth={800}
      display="flex"
      gap={1}
      marginTop={1}
      flexDirection={"column"}
      alignItems={"center"}
    >
      Welcome to Watch Party! Enter a Youtube URL to get started.
      <TextField
        label="Session Name"
        variant="outlined"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Youtube URL"
        variant="outlined"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        fullWidth
      />
      <Button
        disabled={!newUrl}
        onClick={createSession}
        size="small"
        variant="contained"
      >
        Create a session
      </Button>
      <p style={{ marginTop: "30px" }}>Or join an active session</p>
      <Box
        width="100%"
        display="flex"
        flexDirection={"column"}
        alignItems={"center"}
        maxHeight={200}
        overflow={"scroll"}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session Name</TableCell>
              <TableCell>Youtube URL</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => getSessions()}>
                  <RefreshIcon></RefreshIcon>
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions &&
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.name}</TableCell>
                  <TableCell>{session.videoUrl}</TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => {
                        navigate(`/watch/${session.id}`);
                      }}
                      variant="contained"
                    >
                      Join
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default CreateSession;
