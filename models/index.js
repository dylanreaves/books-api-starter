const dbConnection = require('../db')
const Book = require("./book");
const Review = require("./review")

Book.hasMany(Review)
Review.belongsTo(Book, {
  foreignKey: 'bookId'
})

module.exports = {Book, Review}