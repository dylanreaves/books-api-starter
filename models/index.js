const dbConnection = require('../db')
const Book = require("./book");
const Review = require("./review")

Book.hasMany(Review, {
    foreignKey: 'bookId',
    onDelete: 'CASCADE',
    hooks: true,    // Needs to be true in order to actually delete rows.
})
Review.belongsTo(Book, {
    foreignKey: 'bookId',
})

module.exports = {Book, Review}