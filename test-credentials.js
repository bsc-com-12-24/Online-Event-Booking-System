require('dotenv').config();
const oracledb = require('oracledb');

async function testCredentials() {
  console.log('=== Testing .env Credentials ===\n');
  console.log('Username:', process.env.DB_USERNAME);
  console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
  console.log('Service Name:', process.env.DB_SERVICE_NAME);
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('');
  
  const connectString = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`;
  console.log('Connection string:', connectString);
  console.log('');
  
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectString: connectString
    });
    
    console.log('SUCCESS! Connection works!\n');
    const result = await connection.execute('SELECT USER FROM DUAL');
    console.log('Connected as:', result.rows[0][0]);
    await connection.close();
    console.log('\nThe credentials in your .env file are correct!');
  } catch (err) {
    console.error('FAILED with error:', err.message);
    console.log('\nPossible issues:');
    console.log('1. Username or password is incorrect');
    console.log('2. Service name is wrong');
    console.log('3. Database is not accessible');
  }
}

testCredentials();
