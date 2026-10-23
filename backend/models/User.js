const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  // Unique normalized key prevents case-only duplicates for new accounts.
  usernameKey: { type: String, unique: true, sparse: true },
  // Optional so existing accounts remain compatible. Local accounts store
  // only a bcrypt hash in this field.
  password:  { type: String, select: false },
  email:     { type: String, unique: true, sparse: true },
  phone:     { type: String, unique: true, sparse: true },
  // Preserve legacy account metadata; no Google sign-in route uses this field.
  googleId:  { type: String, unique: true, sparse: true },
  picture:   { type: String, default: '' },   // Optional profile picture URL.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
