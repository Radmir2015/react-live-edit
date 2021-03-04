const Sequelize = require('sequelize');
const sequelize = require('../../utils/ormDatabase');

const Document = sequelize.define('document', {
	roomId: {
		type: Sequelize.STRING,
		defaultValue: ''
	},
	title: {
		type: Sequelize.STRING,
		defaultValue: ''
	},
	select: {
		type: Sequelize.STRING,
		defaultValue: ''
	},
	date: {
		type: Sequelize.STRING,
		defaultValue: ''
	},
	description: {
		type: Sequelize.TEXT,
		defaultValue: ''
	},
	submitted: {
		type: Sequelize.BOOLEAN,
		defaultValue: true
	},
});

module.exports = Document;

