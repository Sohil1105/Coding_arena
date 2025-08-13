const mongoose = require('mongoose');
const User = require('./models/user');

const updateUserRole = async () => {
  try {
    await mongoose.connect('mongodb://mongo:27017/coding-arena', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email: 'souravsohil1111@gmail.com' });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log('User role updated successfully.');
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.disconnect();
  }
};

updateUserRole();
