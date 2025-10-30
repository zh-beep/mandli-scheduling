const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  // Login as admin
  console.log('Logging in as admin...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'mandli', password: 'Mandli8' })
  });

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✓ Logged in\n');

  // Create a test user
  console.log('Creating test user...');
  const createResponse = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Test User',
      email: 'test.user@example.com',
      cell_phone: '+1-555-9999',
      gender: 'gents'
    })
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.log('Note: User may already exist:', error.message);

    // Get existing user
    const usersResponse = await fetch(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    const existingUser = usersData.users.find(u => u.email === 'test.user@example.com');

    if (existingUser) {
      console.log('✓ Using existing test user\n');
      await generateLink(token, existingUser.id, existingUser.full_name);
      return;
    } else {
      console.error('Could not create or find test user');
      return;
    }
  }

  const createData = await createResponse.json();
  console.log('✓ Test user created:', createData.user.full_name);
  console.log('  Email:', createData.user.email);
  console.log('  ID:', createData.user.id);
  console.log();

  // Generate unique link
  await generateLink(token, createData.user.id, createData.user.full_name);
}

async function generateLink(token, userId, userName) {
  console.log('Generating unique availability link...');
  const linkResponse = await fetch(`${API_BASE_URL}/users/${userId}/link`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!linkResponse.ok) {
    console.error('Failed to generate link');
    return;
  }

  const linkData = await linkResponse.json();

  console.log('\n' + '='.repeat(70));
  console.log('✅ UNIQUE AVAILABILITY LINK GENERATED');
  console.log('='.repeat(70));
  console.log();
  console.log('User:', userName);
  console.log('Email:', linkData.user.email);
  console.log();
  console.log('Link (valid for 90 days):');
  console.log(linkData.link);
  console.log();
  console.log('='.repeat(70));
  console.log();
  console.log('💡 This link allows the user to submit their availability');
  console.log('   without needing to log in. The link is unique and secure.');
  console.log();
}

main().catch(console.error);
