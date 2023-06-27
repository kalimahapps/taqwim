import type { Disposable, LogOutputChannel } from 'vscode';
import { window } from 'vscode';

/**
 * A singleton logger class.
 */
export class Logger implements Disposable {
	/**
	 * The singleton instance.
	 */
	private static instance: Logger;

	/**
	 * The output channel instance.
	 */
	private outputChannel: LogOutputChannel;

	/**
	 * Constructor function.
	 */
	public constructor() {
		this.outputChannel = window.createOutputChannel('Taqwim', {
			log: true,
		});
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return {Logger} The singleton instance.
	 */
	static getInstance(): Logger {
		Logger.instance = Logger.instance || new Logger();
		return Logger.instance;
	}

	public getOutputChannel(): LogOutputChannel {
		return this.outputChannel;
	}

	/**
	 * Disposes of a logger's resources.
	 */
	public dispose(): void {
		this.outputChannel.dispose();
	}

	/**
	 * Log a single message to the output channel.
	 *
	 * @param {string} message The message to log.
	 * @param {string} level   The log level.
	 */
	private logSingle(message: string, level = 'info'): void {
		const now = new Date();
		const dateTime = now.toLocaleDateString('en-AU', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
		});

		if (level === 'error') {
			this.outputChannel.error(`[${dateTime}] ${message.trim()}`);
		} else {
			this.outputChannel.info(`[${dateTime}] ${message.trim()}`);
		}
	}

	/**
	 * Log messages to the output channel.
	 *
	 * @param {unknown[]} messages The messages to log.
	 */
	public log(...messages: unknown[]): void {
		messages.forEach((message: unknown) => {
			if (typeof message === 'string') {
				this.logSingle(message);
			} else {
				this.logSingle(JSON.stringify(message));
			}
		});
	}

	/**
	 * Same as log() but with error level.
	 *
	 * @param {unknown[]} messages The messages to log.
	 */
	public logError(...messages: unknown[]): void {
		messages.forEach((message: unknown) => {
			if (typeof message === 'string') {
				this.logSingle(message, 'error');
			} else {
				this.logSingle(JSON.stringify(message), 'error');
			}
		});
	}
}

export const logger = Logger.getInstance();