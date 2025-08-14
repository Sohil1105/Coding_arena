const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
    {
        name: 'sourav sohil',
        phone: '9701257999',
        email: 'souravsohil1111@gmail.com',
        password: 'sourav@0511',
        role: 'admin'
    },
    {
        name: 'user1',
        phone: '0987654321',
        email: 'user1@example.com',
        password: 'user123',
        role: 'user'
    }
];

const seedUsers = async () => {
    await User.deleteMany({});

    for (const user of users) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        const newUser = new User(user);
        await newUser.save();
    }

    console.log('Users collection seeded!');
};

module.exports = seedUsers;
