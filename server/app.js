const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { nanoid } = require('nanoid');
const db = require('./db');

const Document = require('./modules/Document/DocumentController')

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(morgan('dev'));

app.get('/', (req, res) => {
	const randomId = nanoid(8);
	global.storage = { ...global.storage, [randomId]: { roomId: randomId, state: {} } };
	res
		.status(200)
		.send({
			roomId: randomId
		})
});

app.post('/auth', (req, res) => {
	const { login, password } = req.body;

	const account = db.find(x => x.login === login && x.password === password);

	if (!account) {
		res
			.status(401)
			.send({ message: 'wrong login or password' });
	
		return;
	}			

	res
		.status(200)
		.send({
			message: 'ok',
			id: account.id
		})

});

const checkAuth = (req, res, next) => {
	const token = req.headers['x-access-token'] || req.headers['authorization'] || '';

	if (!db.some(x => "" + x.id === token))
		return res.status(401).json({
			message: 'unauthorized'
		});
	
	next();
}

app.get('/:roomId/submit', checkAuth, async (req, res) => {
	const { roomId } = req.params;

	const doc = await Document.get({ roomId, submitted: true });

	if (doc) {
		res.status(409)
			.send({
				message: 'this doc already submitted'
			});

		return;
	}

	if (!Object.keys(global.storage).includes(roomId)) {
		res.status(404)
			.send({
				message: 'doc not found'
			});

		return;
	}

	const tempDoc = global.storage[roomId];

	tempDoc.state.submitted = true;
	
	await Document.updateOrCreate({ ...tempDoc.state, roomId: tempDoc.roomId });

	res.status(200)
		.send({
			message: 'successfully submitted'
		});
});


module.exports = app;
