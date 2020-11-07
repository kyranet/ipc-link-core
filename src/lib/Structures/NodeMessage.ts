import { SocketHandler } from './Base/SocketHandler';
import { createFromID } from '../Util/Header';
import { serialize } from 'binarytf';

export class NodeMessage {

	/**
	 * The client that received this message.
	 * @since 0.0.1
	 */
	public readonly client!: SocketHandler;

	/**
	 * The id of this message.
	 * @since 0.0.1
	 */
	public readonly id!: number;

	/**
	 * The data received from the socket.
	 * @since 0.0.1
	 */
	public data: any;

	/**
	 * Whether the message is receptive or not.
	 * @since 0.0.1
	 */
	public readonly receptive!: boolean;

	/**
	 * @since 0.0.1
	 * @param client The socket that received this message.
	 * @param id The ID of the message.
	 * @param receptive Whether or not this message accepts a reply.
	 * @param data The data received from the socket.
	 */
	public constructor(client: SocketHandler, id: number, receptive: boolean, data: any) {
		Object.defineProperties(this, {
			client: { value: client },
			id: { value: id, enumerable: true },
			receptive: { value: receptive, enumerable: true }
		});

		this.data = data;
	}

	/**
	 * Reply to the socket.
	 * @since 0.0.1
	 * @param content The content to send.
	 */
	public reply(content: unknown): void {
		if (this.receptive && this.client.socket.writable) {
			this.client.socket!.write(createFromID(this.id, false, serialize(content)));
		}
	}

	/**
	 * Freeze the message.
	 * @since 0.0.1
	 */
	public freeze() {
		return Object.freeze(this);
	}

	/**
	 * The toJSON overload for JSON.stringify.
	 * @since 0.0.1
	 */
	public toJSON() {
		return {
			id: this.id,
			data: this.data,
			receptive: this.receptive
		};
	}

	/**
	 * The toString overload for string casting.
	 * @since 0.0.1
	 */
	public toString() {
		return `NodeMessage<${this.id}>`;
	}

}
