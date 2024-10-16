import { produceMessage } from "./helper.js";
export function setupSocket(io) {
    io.use((socket, next) => {
        const room = socket.handshake.auth.room || socket.handshake.headers.room;
        if (!room) {
            return next(new Error("Invalid room"));
        }
        socket.room = room;
        next();
    });
    io.on("connection", (socket) => {
        // * Join the room
        socket.join(socket.room);
        socket.on("message", async (data) => {
            try {
                await produceMessage("chats", data);
            }
            catch (error) {
                console.log("The kafka produce error is", error);
            }
            socket.to(socket.room).emit("message", data);
        });
        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });
    });
}
