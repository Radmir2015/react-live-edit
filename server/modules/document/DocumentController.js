const Document = require('./DocumentModel');

exports.create = async (data) => {
	const doc = await Document.create(data);

	return JSON.parse(JSON.stringify(doc))	
}

exports.updateOrCreate = async (data) => {
	const p = await Document
		.findOne({ where: { roomId: data.roomId } })
		.then(row => row ? row.update(data) : Document.create(data));

	return p;
}

exports.get = async (filter) => {
	const docs = await Document.findOne({ where: filter });

	return docs;
}
