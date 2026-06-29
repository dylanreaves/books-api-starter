const { Sequelize } = require('sequelize')

const dbConnection = new Sequelize('postgres://localhost:5432/books_api')

module.exports = dbConnection