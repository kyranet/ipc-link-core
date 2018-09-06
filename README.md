# Veza

**Veza** is a lower level version of [IPC-Link](https://github.com/kyranet/ipc-link) that is lightning fast and operates with raw buffers as opposed to sending buffered stringified JSON objects. This library has no dependencies and uses built-in modules (`net`, `events`...) to operate.

In Veza, you have "nodes", which can either create a server (and receive messages) or connect to other servers, even both at the same time. Additionally, you have `Node#sendTo(socket, data);` which will wait for the socket to reply back.

## Usage

Check the examples [here](https://github.com/kyranet/veza/tree/master/test) for working micro **Veza** applications.

`hello.js`

```javascript
// This example must be run before interactive/world, since this serves the
// IPC server the other sockets connect to.
const { Node } = require('veza');

const node = new Node('hello')
	.on('connection', (name, socket) => {
		console.log(`Connected to ${name}`);
		node.sendTo(socket, 'Hello')
			.then(reply => console.log(`Hello ${reply}`));
	})
	.on('listening', console.log.bind(null, 'Listening'))
	.on('message', console.log.bind(null, 'Message'))
	.on('error', console.error.bind(null, 'Error'))
	.on('socketClose', console.log.bind(null, 'Closed Socket:'))
	.serve('hello', 8001);
```

`world.js`

```javascript
// This example depends on hello.js to be running in another process.
// This Node is a socket that replies to hello.js with "world!" when it
// receives "Hello".
const { Node } = require('veza');

const node = new Node('world')
	.on('message', message => {
		console.log(`Received data from ${message.from}:`, message);
		if (message.data === 'Hello')
			message.reply('world!');
	})
	.on('error', console.error)
	.on('connect', () => console.log('Connected!'));

node.connectTo('hello', 8001)
	.catch(() => console.log('Disconnected!'));
```

---

The differences with IPC-Link are:

- **Veza** does not rely on **node-ipc**, but rather uses `net.Socket`, `net.Server` and `events.EventEmitter`.
- **Veza** does not use JSON objects: it uses buffers with headers.
- **Veza** does not abstract `net.Socket#connect` nor `net.Server#listen`, as opposed to what **node-ipc** does.
- **Veza** does not send a message to a socket if it's not connected, you must connect first (in node-ipc, it attempts to connect using the name, which breaks in many cases and leads to unexpected behaviour).
- **Veza** supports recurrency as opposed to blocking message queues.

> Originally, **Veza** was called **ipc-link-core**.
