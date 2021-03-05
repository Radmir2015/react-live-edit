require('dotenv').config();
const app = require('./app');
const http = require('http').Server(app);
const db = require('./utils/ormDatabase');
const cron = require('./services/cron');

const Document = require('./modules/document/DocumentController');

const io = require('socket.io')(http, {
	cors: {
		origin: "*",
	}
});

global.storage = {}

io.on('connection', async (socket) => {
	const { roomId } = socket.handshake.query

	if (!global.storage[roomId]) {
		const foundDoc = await Document.get({ roomId });
		if (foundDoc) {
			const { createdAt, updatedAt, roomId, id, ...tempDoc } = JSON.parse(JSON.stringify(foundDoc));
			global.storage[foundDoc.roomId] = {
				state: tempDoc,
				roomId
			}
		} else {
			socket.emit('documentNotFound', roomId);
		}
	}

	socket.emit('stateUpdated', Object.assign({ roomId, state: {} }, global.storage[roomId] || {}))

	socket.on('disconnect', () => {

	});

	socket.on('stateChanged', (newState, account) => {
		global.storage[newState.roomId] = { state: { ...(global.storage[newState.roomId] && global.storage[newState.roomId].state), ...newState.state }, roomId: newState.roomId }
		
		socket.broadcast.emit('stateUpdated', newState)
		socket.broadcast.emit('documentEdited', newState.roomId, account, Object.keys(newState.state)[0])
	})
});

db.sync({ alter: true })
	.then(() => {
		console.log('Database syncronization success');

		http.listen(3000, () => {
			console.log('listening on *:3000');
		});
		// cron.run();
	})
	.catch(err => {
		console.log(err);
	});
