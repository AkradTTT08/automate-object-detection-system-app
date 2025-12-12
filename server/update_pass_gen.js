const bcrypt = require('bcrypt');

bcrypt.hash('admin2025', 12).then(hash => {
    console.log(`UPDATE aods_dev_v3.users SET usr_password = '${hash}' WHERE usr_username = 'admin2025';`);
}).catch(console.error);
