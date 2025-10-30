const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  // Login
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'mandli', password: 'Mandli8' })
  });

  const loginData = await loginResponse.json();
  const token = loginData.token;

  console.log('Token:', token.substring(0, 20) + '...');

  // Get users
  const usersResponse = await fetch(`${API_BASE_URL}/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const usersData = await usersResponse.json();
  console.log('\nUsers:');
  console.log(JSON.stringify(usersData, null, 2));
}

main().catch(console.error);
