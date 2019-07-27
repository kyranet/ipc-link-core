import { DeserializerError, DeserializerReason } from 'binarytf/dist/lib/errors/DeserializerError';

export class MessageError extends Error {

	public kind: DeserializerReason;

	public constructor(prefix: string, error: DeserializerError) {
		super(`${prefix}: ${error.message} [${error.kind}]`);
		this.kind = error.kind;
	}

}

export function makeError(prefix: string, error: Error) {
	if (error instanceof DeserializerError) return new MessageError(prefix, error);
	return new Error(`${prefix}: ${error.message}`);
}
