const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Sequelize } = require('sequelize')
const { Op } = require("sequelize");

// TODO: Workshop Part 1: import your db connection from ./db once it's wired up.
const db = require('./db')

//db.authenticate().then(() => console.log("DB connected")).catch(console.error)
// const Book = require("./models/book")
// const Review = require("./models/review")

// WILL FIX LATER
const Book = require("./models").Book;
const Review = require("./models").Review

// const Book = require("./models/book")
// const Review = require("./models/review")

const app = express();
const PORT = 8080;

// middleware ---------------------------------------
app.use(express.json()); // lets the server read JSON sent in a request body (req.body)
app.use(morgan("dev")); // logs method + url for every request
app.use(cors()); // allows a future frontend (different origin) to call this API

// in-memory data ------------------------------------
// let books = [
//   { id: 1, title: "The Pragmatic Programmer", author: "David Thomas", genre: "Tech", available: true },
//   { id: 2, title: "Educated", author: "Tara Westover", genre: "Memoir", available: true },
//   { id: 3, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", available: false },
//   { id: 4, title: "Sapiens", author: "Yuval Noah Harari", genre: "History", available: true },
//   { id: 5, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", available: true },
// ];

// let nextId = 6; // use this for any new book you create

// routes --------------------------------------------
// TODO: Workshop Part 4: one at a time, swap the array logic below for a real
// Book query. Keep the same path, same status codes, same 404 checks —
// only what's inside each try block changes.

// Part 2: smallest possible route, before touching book data
app.get("/", (request, response) => {
  response.send("Books API is running");
});

// Part 3: GET all books
// TODO: Workshop: swap `books` for the Book method that returns every row.
app.get("/api/books", async (request, response, next) => {
  try {
    if (Object.keys(request.query).length > 0) {
      const queryToBeFixed = Object.assign({},request.query) // Create a copy of the query that we can edit
      const describe = await Book.describe()

      // Removes all fields in query that can't be used in the database
      for (const [key, value] of Object.entries(queryToBeFixed)) {
        if (!Object.hasOwn(describe, key)) {
          delete queryToBeFixed[key]
        } 
        // else {
        //   console.log(key, "was found in both!")
        // }
      }

      const where = {...queryToBeFixed}

      if (typeof request.query.search === "string") {
        where.title = {
          [Op.iLike]: request.query.search+'%',
        };
      }

      const allBooks = await Book.findAll({
        where,
      });
      return response.json(allBooks);
    }

    const allBooks = await Book.findAll();
    return response.json(allBooks);
  } catch (error) {
    next(error);
  }
});

// Part 4: GET one book by id
// TODO: Workshop: swap `.find()` for the Book method that looks up by primary key.
// It returns null when nothing matches — your 404 check below still applies.
app.get("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // request.params.id is always a string — Number() makes it comparable
    const foundBook = await Book.findByPk(id, {
      include: Review
    })

    if (!foundBook) {
      return response.sendStatus(404);
    }

    return response.json(foundBook);
  } catch (error) {
    next(error);
  }
});

app.get("/api/books/:id/reviews", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // request.params.id is always a string — Number() makes it comparable
    
    // There are actually two methods of doing this from my understanding.
    // We can find all reviews that match the Id.
    const foundReviews = await Review.findAll({
      where: {bookId: id}
    })

    // Or we can find the book by its specific Id and just return its reviews field.
    // const foundBook = await Book.findByPk(id, {
    //   include: Review
    // })
    // return response.json(foundBook.reviews)

    // It might be a good idea to see which table has more rows and use that to decide
    // which one might be more optimized. We can use .count() to get the size of the tables.
    // console.log(await Book.count())
    // console.log(await Review.count())

    if (!foundReviews) {
      return response.sendStatus(404);
    }

    return response.json(foundReviews);
  } catch (error) {
    next(error);
  }
});

app.get("/api/reviews/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // request.params.id is always a string — Number() makes it comparable
    const foundReview = await Review.findByPk(id)
    
    if (!foundReview) {
      return response.sendStatus(404);
    }

    return response.json(foundReview); // 204 No Content — no body on a successful delete
  } catch (error) {
    next(error);
  }
});

// Extra route that returns ALL reviews
app.get("/api/reviews", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // request.params.id is always a string — Number() makes it comparable
    const foundReviews = await Review.findAll()

    if (!foundReviews) {
      return response.sendStatus(404);
    }

    return response.json(foundReviews);
  } catch (error) {
    next(error);
  }
});

// Part 5: POST a new book
// TODO: Workshop: swap the manual id/push for the Book method that creates a row
// directly from req.body. nextId goes away — the database assigns the id now.
app.post("/api/books", async (request, response, next) => {
  try {
    const { title, author, genre } = request.body;
    const newBook = await Book.create({
      title: title,
      author: author,
      genre: genre,
    })

    return response.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
});

function validateReview(request, response, next) {
  const reviewer = request.body.reviewer
  const rating = Number(request.body.rating)
  const comment = request.body.comment

  if (rating && (rating > 0 && rating < 6)) {
    next()
  } else {
    return response.status(400).send("Invalid format for review")
  }
}

app.post("/api/books/:id/reviews", validateReview, async (request, response, next) => {
  try {
    const id = Number(request.params.id)
    const { reviewer, rating, comment } = request.body;
    const newReview = await Review.create({
      reviewer: reviewer,
      rating: rating,
      comment: comment,
      bookId: id,
    })

    return response.status(201).json(newReview);
  } catch(error) {
    next(error);
  }
})

// Part 6: PATCH an existing book — only changes the fields that were sent
// TODO: Workshop: find the book the same Sequelize way as the GET-one route above,
// then call the instance method that updates it in place with req.body.
app.patch("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundBook = await Book.findByPk(id)

    if (!foundBook) {
      return response.sendStatus(404);
    }

    foundBook.update(request.body)

    return response.status(200).json(foundBook);
  } catch (error) {
    next(error);
  }
});

// Part 7: DELETE a book
// TODO: Workshop: find the book first, same as above, then call the instance
// method that removes itself — no more findIndex/splice.
app.delete("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id)
    const foundBook = await Book.findByPk(id)

    if (!foundBook) {
      return response.sendStatus(404);
    }

    await foundBook.destroy()
    return response.sendStatus(204); // 204 No Content — no body on a successful delete
  } catch (error) {
    next(error);
  }
});

app.delete("/api/reviews/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // request.params.id is always a string — Number() makes it comparable
    const foundReview = await Review.findByPk(id)
    
    if (!foundReview) {
      return response.sendStatus(404);
    }

    await foundReview.destroy()
    return response.sendStatus(204); // 204 No Content — no body on a successful delete
  } catch (error) {
    next(error);
  }
});

// TODO: Workshop cleanup: once all five routes above use Book instead of `books`,
// delete the `books` array and `nextId` variable up top — nothing should
// reference them anymore.

// error-handling middleware -------------------------
// 4 parameters (error first) is how Express recognizes this as an error handler.
app.use((error, request, response, next) => {
  console.error(error);
  return response.sendStatus(500);
});

// app server ------------------------------------------
async function startApp() {
  // TODO: Workshop Part 3: this is where your table gets created from the Book
  // model. Call the sync method on your db connection and await it — the
  // table must exist before app.listen lets any request in.

  await db.sync()
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startApp();
