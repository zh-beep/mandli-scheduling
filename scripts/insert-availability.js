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

  console.log('Logged in successfully\n');

  // Availability data for 5 users
  const availabilityData = [
    {
      name: 'Ahmed Khan',
      user_id: '22ea57f2-b16f-4f2b-a3ac-0094e5b36785',
      month: '2025-11',
      available_days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29]
    },
    {
      name: 'Sarah Johnson',
      user_id: '610e0fd0-dd0d-4b1b-ae16-757954b78fd6',
      month: '2025-11',
      available_days: [1,2,3,4,5,8,9,10,11,12,13,14,15,16,17,18,21,22,23,24,25,28,29]
    },
    {
      name: 'Raj Patel',
      user_id: '63e353ae-bef3-4cac-9ccf-d10393281641',
      month: '2025-11',
      available_days: [2,3,4,5,6,7,8,9,10,11,14,15,16,17,18,19,20,21,22,25,26,27]
    },
    {
      name: 'Maria Garcia',
      user_id: '565ddda4-1dc5-46a4-8ac3-a12f21b6c741',
      month: '2025-11',
      available_days: [1,2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,23,24,25,26,27,28]
    },
    {
      name: 'Emily Wilson',
      user_id: '06d1835a-3923-4a09-9fe5-867870b12135',
      month: '2025-11',
      available_days: [1,4,5,6,7,8,9,10,11,12,15,16,17,18,19,22,23,24,25,26,29]
    }
  ];

  // Insert availability for each user
  for (const data of availabilityData) {
    console.log(`Inserting availability for ${data.name} (${data.available_days.length} days)...`);

    const response = await fetch(`${API_BASE_URL}/availability/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: data.user_id,
        month: data.month,
        available_days: data.available_days
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✓ ${data.name}: ${data.available_days.length} days added`);
    } else {
      console.error(`✗ ${data.name}: Error - ${result.message || JSON.stringify(result)}`);
    }
  }

  console.log('\n--- Verification ---');

  // Verify the data
  const verifyResponse = await fetch(`${API_BASE_URL}/availability/month/2025-11`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const verifyData = await verifyResponse.json();
  console.log('\nAvailability for November 2025:');

  if (verifyData.availability) {
    verifyData.availability.forEach(a => {
      console.log(`- User ID: ${a.user_id.substring(0, 8)}... - ${a.available_days.length} days available`);
    });
  } else {
    console.log(JSON.stringify(verifyData, null, 2));
  }
}

main().catch(console.error);
