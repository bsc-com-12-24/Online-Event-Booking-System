const oracledb = require('oracledb');

async function testConnection() {
  console.log('=== Testing Oracle Database Connection ===\n');
  console.log('Configuration:');
  console.log('  Username: C##event_booking');
  console.log('  Password: 2006');
  console.log('  Service Name: XEPDB1');
  console.log('  Host: localhost:1521\n');

  try {
    const connection = await oracledb.getConnection({
      user: 'C##event_booking',
      password: '2006',
      connectString: 'localhost:1521/XEPDB1'
    });
    
    console.log('SUCCESS! Connected to Oracle Database!\n');
    
    // Fixed: Using single quotes instead of double quotes
    const result1 = await connection.execute('SELECT \'Connected to XEPDB1\' as status FROM DUAL');
    console.log('Status:', result1.rows[0][0]);
    
    const result2 = await connection.execute('SELECT USER FROM DUAL');
    console.log('Current User:', result2.rows[0][0]);
    
    const result3 = await connection.execute('SELECT SYS_CONTEXT(\'USERENV\', \'CON_NAME\') as container FROM DUAL');
    console.log('Current PDB:', result3.rows[0][0]);
    
    await connection.close();
    console.log('\nAll tests passed! Your NestJS app should work now.');
    console.log('\nYou can now start your application with:');
    console.log('npm run start:dev');
    
  } catch (err) {
    console.error('Connection Failed!\n');
    console.error('Error:', err.message);
  }
}

testConnection();
