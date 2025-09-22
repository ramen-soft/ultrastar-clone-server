import { EventEmitter } from "events";
import { Torrent } from "webtorrent";
import { Task } from "../models/Task";

interface AppEventsMap {
	"torrent:added": (magnetLink: string) => void;
	"torrent:ready": (torrent: Torrent) => void;
	"torrent:progress": (
		bytes: number,
		totalBytes: number,
		progress: number,
		speed: number
	) => void;
	"torrent:done": (torrent: Torrent) => void;

	"task:added": (task: Task) => void;
	"task:ready": (task: Task) => void;
	"task:progress": (
		task: Task,
		bytes: number,
		totalBytes: number,
		progress: number,
		speed: number
	) => void;
	"task:done": (task: Task) => void;
}

class AppEvents extends EventEmitter {
	// on / addListener
	on<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.on(event as string, listener as (...args: any[]) => void);
	}
	addListener<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.addListener(
			event as string,
			listener as (...args: any[]) => void
		);
	}

	// once / prependOnceListener
	once<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.once(
			event as string,
			listener as (...args: any[]) => void
		);
	}
	prependOnceListener<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.prependOnceListener(
			event as string,
			listener as (...args: any[]) => void
		);
	}

	// off / removeListener
	off<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.off(event as string, listener as (...args: any[]) => void);
	}
	removeListener<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.removeListener(
			event as string,
			listener as (...args: any[]) => void
		);
	}

	// prependListener
	prependListener<K extends keyof AppEventsMap>(
		event: K,
		listener: AppEventsMap[K]
	): this {
		return super.prependListener(
			event as string,
			listener as (...args: any[]) => void
		);
	}

	// emit
	emit<K extends keyof AppEventsMap>(
		event: K,
		...args: Parameters<AppEventsMap[K]>
	): boolean {
		return super.emit(event as string, ...args);
	}
}

export default new AppEvents();
