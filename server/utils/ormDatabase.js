const Sequelize = require('sequelize');

const database = process.env.SQDB;
const username = process.env.SQUSER;
const password = process.env.SQPASS;
const host = process.env.SQHOST;
const dialect = process.env.SQDIALECT;
const logging = Boolean(Number(process.env.SQLOGGING));

const sequelize = new Sequelize(database, username, password, {
  dialect,
  host,
  logging,
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

module.exports = sequelize;
