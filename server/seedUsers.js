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
    for (const userData of users) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            const newUser = new User({ ...userData, password: hashedPassword });
            await newUser.save();
            console.log(`User ${userData.email} seeded.`);
        } else {
            console.log(`User ${userData.email} already exists, skipping.`);
        }
    }
    console.log('Users collection seeding process completed.');
};

module.exports = seedUsers;
