### Required Functionality

- [x] **Creating a session**. Any user should be able to create a session to watch a given Youtube video.
- [x] **Joining a session**. Any user should be able to join a session created by another user using the shareable session link.
- [x] **Playing/pausing** the video. When a participant pauses the video, it should pause for everyone. When a participant plays the video, it should start playing for everyone.
- [x] **“Seek”**. When someone jumps to a certain time in the video it should jump to that time for everyone.
- [x] **Late to the party**... Everything should stay synced even if a user joins the watch party late (e.g. the video is already playing)
- [x] **Player controls.** All the player controls (e.g. play, pause, and seek) should be intuitive and behave as expected. For play, pause & seek operations you can use the built-in YouTube controls or disable the YouTube controls and build your own UI (including a slider for the seek operation)

### Usage

To run the back end

```
  cd server
  npm i
  npm start
```

To run the front end (From the root dir)

```
cd client
npm i
npm start
```

The application can be accessed at `http://localhost:3000`
