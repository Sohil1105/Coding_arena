const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/user');

const deleteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await User.deleteOne({ email: 'souravsohil1111@gmail.com' });
    if (result.deletedCount > 0) {
      console.log('User deleted successfully.');
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    mongoose.disconnect();
  }
};

deleteUser();
