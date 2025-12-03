SET search_path TO aods_dev_v3;

-- Update password hashes
-- admin2025 password hash (verified)
UPDATE users SET usr_password = '$2b$12$SSh6SsUhp76obyboQctCLuVDF2/drGsIqwYdk4xh048cwcpNrE/ku' WHERE usr_username = 'admin2025';

-- test password hash  
UPDATE users SET usr_password = '$2b$12$e9swrpZJozXKSU/BVcRAk.GGr.8TY8tr4tR0A0A089ETE2SKk8p52' WHERE usr_username = 'test';

-- Verify
SELECT usr_username, LEFT(usr_password, 30) as pwd_hash FROM users;

