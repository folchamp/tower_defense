"use strict";

class CommunicationManager {
    constructor(io) {
        this.io = io;
        this.listeners = [];
        io.on("connection", (socket) => {
            socket.on("disconnect", (transportCloseString) => {
                this.broadcast({
                    message: "client_disconnect",
                    socketID: socket.id,
                });
            });
            socket.on("message", (data) => {
                data.socketID = socket.id;
                this.broadcast(data);
            });
        });
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    broadcast(data) {
        this.listeners.forEach((listener) => {
            listener(data);
        });
        if (data.message.startsWith("server")) {
            this.io.emit("message", data);
        }
    }
    getBroadcastMethod() {
        return (data) => { this.broadcast(data); };
    }
}

exports.CommunicationManager = CommunicationManager;