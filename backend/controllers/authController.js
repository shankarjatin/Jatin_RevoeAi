const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const User = require('../models/userModel');

// Signup
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });

    await user.save();
    const token = jwt.encode({ email: user.email }, process.env.SECRET_KEY);

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error in signup', error: err });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.encode({ email: user.email }, process.env.SECRET_KEY);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error in login', error: err });
  }
};
