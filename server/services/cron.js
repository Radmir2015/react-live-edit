const nodeCron = require('node-cron');
const Document = require('../modules/Document/DocumentController');

const saveTempStorage = async () => {
	for (const doc of Object.values(global.storage)) {
		console.log(`Saving ${doc.roomId} room to db`);
		const docState = Object.assign({ submitted: false }, doc.state);
		
		await Document.updateOrCreate({ ...docState, roomId: doc.roomId });
	}
}

const run = () => {
	nodeCron.schedule('*/30 * * * * *', saveTempStorage);
}

module.exports = { run }
