const seedUsers = require('./seedUsers');
const seedProblems = require('./seedFromJson');

const seedAll = async () => {
    try {
        console.log('Seeding users...');
        await seedUsers();
        console.log('Seeding problems...');
        await seedProblems();
        console.log('All seed scripts executed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    }
};

module.exports = seedAll;
