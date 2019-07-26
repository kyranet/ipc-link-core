import { kInvalidMessage } from '../Util/Constants';
import { read } from '../Util/Header';
import { deserializeWithMetadata } from 'binarytf';

export class Queue extends Map<number, QueueEntry> {

	private offset: number = 0;
	private _rest: Uint8Array | null = null;

	/**
	 * Returns a new Iterator object that parses each value for this queue.
	 */
	public *process(buffer: Uint8Array | null) {
		if (this._rest) {
			buffer = Buffer.concat([this._rest, buffer!]);
			this._rest = null;
		}

		while (buffer) {
			// If the header separator was not found, it may be due to an impartial message
			/* istanbul ignore next: This is hard to reproduce in Azure, it needs the buffer to overflow and split to extremely precise byte lengths. */
			if (buffer.length - this.offset <= 11) {
				this._rest = buffer;
				break;
			}

			const { id, receptive, byteLength } = read(buffer.subarray(this.offset, this.offset + 11));

			// If the message is longer than it can read, buffer the content for later
			if (byteLength > buffer.byteLength) {
				this._rest = buffer;
				break;
			}

			try {
				const { value, offset } = deserializeWithMetadata(buffer, this.offset + 11);
				if (offset === -1) {
					this.offset = 0;
					buffer = null;
				} else {
					this.offset = offset;
				}
				yield { id, receptive, data: value };
			} catch {
				this.offset = 0;
				yield kInvalidMessage;
				break;
			}
		}
	}

}

interface QueueEntry {
	resolve: (value: any) => void;
	reject: (error: Error) => void;
}
