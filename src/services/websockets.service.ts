import { Server, Socket } from "socket.io";
import http from "node:http";
import cookie from "cookie";
import { decodeToken, TokenType } from "../utils/jwt";
import events from "./appevents.service";

class SocketsService {
	private sockets = new Map();
	private io: Server | undefined;
	constructor() {
		events.on("task:added", (task) => {
			// enviamos el evento via websocket al usuario correspondiente
			const sck = this.sockets.get(task.userId) || [];
			sck.forEach((s: Socket) => {
				s.emit("task:added", task);
			});

			console.log(
				`Task added: ${task.torrentId} for user ${task.userId}`
			);
		});

		events.on(
			"task:progress",
			(task, bytes, totalBytes, progress, speed) => {
				const sck = this.sockets.get(task.userId) || [];
				sck.forEach((s: Socket) => {
					s.emit("task:progress", {
						taskId: task.id,
						bytes,
						totalBytes,
						progress,
						speed,
					});
				});

				console.log(
					`Task progress: ${task.torrentId} for user ${
						task.userId
					} - ${(progress * 100).toFixed(2)}% at ${speed.toFixed(
						2
					)} kB/s`
				);
			}
		);

		events.on("task:done", (task) => {
			console.log(`Task done: ${task.torrentId} for user ${task.userId}`);
		});
	}

	initialize(httpServer: http.Server) {
		this.io = new Server(httpServer, {
			cors: {
				credentials: true,
				methods: ["GET", "POST"],
				origin: process.env.USTAR_CLIENT_URL,
			},
		});
		this.sockets = new Map();

		this.io.on("connect", (socket) => {
			if (socket.handshake.headers.cookie) {
				const cookies = cookie.parse(socket.handshake.headers.cookie);
				const access_token = cookies["access_token"];

				if (access_token) {
					const decoded = decodeToken(
						access_token,
						TokenType.ACCESS_TOKEN
					);
					socket.data.userId = decoded?.userId;
				}
			}

			if (socket.data.userId) {
				if (!this.sockets.has(socket.data.userId)) {
					this.sockets.set(socket.data.userId, [socket]);
				} else {
					this.sockets.get(socket.data.userId).push(socket);
				}
			}

			socket.on("disconnect", () => {
				this.sockets.set(
					socket.data.userId,
					this.sockets
						.get(socket.data.userId)
						?.filter((s: Socket) => s.id !== socket.id)
				);
			});
		});
	}
}

export default new SocketsService();
