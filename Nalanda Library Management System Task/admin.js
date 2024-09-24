// authMiddleware.js

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.user) {
      return next();
    }
    return res.status(401).json({ message: 'Please log in first.' });
  };
  
  // Middleware to check if the user is an Admin
  const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  };
  
  // Middleware to check if the user is a Member
  const isMember = (req, res, next) => {
    if (req.user && req.user.role === 'Member') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Members only.' });
  };
  
  module.exports = { isAuthenticated, isAdmin, isMember };
  


//   to restrict access based on the role:
// server.js or routes.js
const express = require('express');
const { isAuthenticated, isAdmin, isMember } = require('./authMiddleware');
const router = express.Router();

// Example routes

// Public route (accessible by everyone)
router.get('/public', (req, res) => {
  res.send('This is a public route');
});

// Admin-only route
router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  res.send('Hello Admin, you can access all operations!');
});

// Member-only route
router.get('/member', isAuthenticated, isMember, (req, res) => {
  res.send('Hello Member, you have restricted access!');
});

// General authenticated route (accessible by both Admins and Members)
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.send('Welcome to your dashboard');
});

module.exports = router;


// User Authentication
// login.js (for user authentication)

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./db'); // Function to get user from the database

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email); // Fetch user by email

  if (user && bcrypt.compareSync(password, user.password)) {
    // Create a JWT token with the user's role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Send token to the client
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// protection router
// middleware.js

const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated with JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ message: 'Token is required' });
  }
};

module.exports = { authenticateJWT };

// JWT authentication middleware to routes
router.get('/admin', authenticateJWT, isAdmin, (req, res) => {
    res.send('Admin content');
  });
  
  router.get('/member', authenticateJWT, isMember, (req, res) => {
    res.send('Member content');
  });
  