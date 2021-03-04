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

let state = {
	title: ''
}

global.storage = {}

const stateWithRoom = (state) => ({
	roomId: "root",
	state
})

io.on('connection', async (socket) => {
	console.log('a user connected', socket.handshake);

	const { roomId } = socket.handshake.query

	socket.roomId = roomId

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

//	socket.join(roomId)

	// socket.emit('stateUpdated', stateWithRoom(state))
	console.log('check', roomId, global.storage, Object.assign({ roomId, state: {} }, global.storage[roomId] || {}))
	socket.emit('stateUpdated', Object.assign({ roomId, state: {} }, global.storage[roomId] || {}))

	socket.on('disconnect', () => {
			console.log('user disconnected');
			// socket.leave(roomId)
	});

	socket.on('stateChanged', (newState, account) => {
		// state = { ...state, ...newState.state }	
		global.storage[newState.roomId] = { state: { ...(global.storage[newState.roomId] && global.storage[newState.roomId].state), ...newState.state }, roomId: newState.roomId }
		console.log('new state', newState, global.storage)
		socket.broadcast.emit('stateUpdated', newState)

		socket.broadcast.emit('documentEdited', newState.roomId, account, Object.keys(newState.state)[0])
	})
});



db.sync({ alter: true })
// db.sync()
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
