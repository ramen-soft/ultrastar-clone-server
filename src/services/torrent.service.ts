import WebTorrent, { Torrent, TorrentOptions } from "webtorrent";
import events from "./appevents.service";
import fs from "fs-extra";

class TorrentService {
	private client: WebTorrent.Instance;
	private options: TorrentOptions = {};

	constructor() {
		this.client = new WebTorrent({
			utp: false,
		});
	}

	public initialize = () => {
		this.options = {
			announce: [
				"https://openbittorrent.com/",
				"https://tracker.opentrackr.org:1337/announce",
			],
			path: process.env.USTAR_DOWNLOAD_FOLDER,
		};
	};

	public findTorrentFileById = async (
		torrentId: string
	): Promise<NonSharedBuffer | null> => {
		const filePath = `${process.env.USTAR_TORRENTS_DIR}/${torrentId}.torrent`;
		try {
			if (fs.existsSync(filePath)) {
				const data = fs.readFileSync(filePath);
				if (data) {
					return data;
				} else {
					throw new Error("Unable to open file.");
				}
			}
			throw new Error("File does not exist.");
		} catch (err) {
			console.error(`Error loading torrent ${torrentId}`, err);
			return null;
		}
	};

	public addTorrentFile = async (file: File | Buffer<ArrayBufferLike>) => {
		return this.add(file);
	};

	public addMagnetLink = async (magnetLink: string) => {
		return this.add(magnetLink);
	};

	public add = async (
		source: string | File | Buffer<ArrayBufferLike>
	): Promise<WebTorrent.Torrent | Error> => {
		return new Promise((resolve, reject) => {
			try {
				const torrent = this.client.add(source, this.options);

				torrent.on("ready", () => {
					//events.emit("torrent:ready", torrent);
				});

				torrent.on("infoHash", () => {
					console.log("torrent infohash", torrent.infoHash);
				});

				torrent.on("download", (bytes) => {
					events.emit(
						"torrent:progress",
						torrent.downloaded,
						torrent.length,
						torrent.progress,
						torrent.downloadSpeed
					);
				});

				torrent.on("metadata", () => {
					console.log("Metadata received:", {
						files: torrent.files.length,
						size: torrent.length,
						name: torrent.name,
					});

					resolve(torrent);

					torrent.files.forEach((file) => file.select());
				});

				torrent.on("error", (err) => {
					console.log(err);
					this.client.remove(torrent.infoHash);
					reject(err);
				});

				torrent.on("done", () => {
					events.emit(
						"torrent:progress",
						torrent.downloaded,
						torrent.length,
						torrent.progress,
						torrent.downloadSpeed
					);
					events.emit("torrent:done", torrent);
					this.client.remove(torrent.infoHash);
				});
			} catch (error) {
				console.log("Error adding torrent: ", error);
				reject(error);
			}
		});
	};
}

const torrentService = new TorrentService();
export default torrentService;
