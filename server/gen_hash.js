const bcrypt = require('bcrypt');

const password = 'admin2025';
const rounds = 12;

bcrypt.hash(password, rounds).then(hash => {
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
}).catch(err => {
    console.error(err);
});
