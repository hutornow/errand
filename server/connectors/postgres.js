require("dotenv").config();
const Sequelize = require("sequelize");
const config = process.env;
const sequelize = new Sequelize(
    `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`
);

module.exports = sequelize;