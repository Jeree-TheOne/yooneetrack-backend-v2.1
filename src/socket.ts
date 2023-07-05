import { Server } from "socket.io";

const WS_PORT: number = parseInt(process.env.WS_PORT as string, 10) || 3001
const io = new Server(WS_PORT)

io.on("connection", (socket) => {
  socket.on('enterWorkspace', (workspace) => {
    socket.join(workspace);
  })

  socket.on('leaveWorkspace', (workspace) => {
    socket.leave(workspace);
  })

  socket.on('enterDesk', (desk) => {
    socket.join(desk);
  })

  socket.on('leaveDesk', (desk) => {
    socket.leave(desk);
  })

  socket.on('enterTask', (task) => {
    socket.join(task);
  })

  socket.on('leaveTask', (task) => {
    socket.leave(task);
  })

  socket.on('enterPersonal', (userId) => {
    socket.join(userId);
  })

  socket.on('leavePersonal', (userId) => {
    socket.leave(userId);
  })
})

export default io;
