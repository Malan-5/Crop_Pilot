const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const userDetails = (user) => ({ id: user._id, username: user.username, createdAt: user.createdAt });
const usernameLookup = (username) => ({ $or: [
  { usernameKey: username.toLowerCase() },
  { username: new RegExp('^' + escapeRegex(username) + '$', 'i') },
] });

router.post('/register', async (req, res) => {
  const { username: input, password, confirmPassword } = req.body || {};
  const username = typeof input === 'string' ? input.trim() : '';
  if (!/^[a-zA-Z][a-zA-Z0-9_.-]{2,31}$/.test(username)) {
    return res.status(400).json({ error: 'Use a username of 3–32 characters, starting with a letter. Letters, numbers, dots, hyphens and underscores are allowed.' });
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Use a password of at least 8 characters and no more than 72 UTF-8 bytes.' });
  }
  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  try {
    if (await User.exists(usernameLookup(username))) {
      return res.status(409).json({ error: 'That username is already taken. Choose another or sign in.' });
    }
    const user = await User.create({
      username, usernameKey: username.toLowerCase(), password: await bcrypt.hash(password, 12),
    });
    return res.status(201).json({ message: 'Account created. Sign in with your username and password.', user: userDetails(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'That username is already taken.' });
    console.error('Registration failed:', error.message);
    return res.status(500).json({ error: 'Unable to create your account. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  const { username: input, password } = req.body || {};
  const username = typeof input === 'string' ? input.trim() : '';
  if (!username || username.length > 80 || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Enter your username and password.' });
  }
  try {
    const user = await User.findOne(usernameLookup(username)).select('+password');
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: userDetails(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ error: 'Unable to sign in. Please try again.' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username createdAt');
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json({ ...userDetails(user), loginType: 'local' });
  } catch (error) {
    console.error('Profile lookup failed:', error.message);
    return res.status(500).json({ error: 'Unable to load your account.' });
  }
});

module.exports = router;
