// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

// Book model
const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  publicationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.sendStatus(403);
  }
};

// Express app setup
const app = express();
app.use(bodyParser.json());

// Add a new book (Admins only)
app.post('/books/add', authenticateJWT, isAdmin, async (req, res) => {
  const { title, author, isbn, publicationDate, genre, copies } = req.body;

  try {
    const newBook = await Book.create({
      title,
      author,
      isbn,
      publicationDate,
      genre,
      copies,
    });
    res.status(201).json({ message: 'Book added successfully!', book: newBook });
  } catch (error) {
    res.status(500).json({ message: 'Error adding the book.', error });
  }
});

// Sync database and start server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
