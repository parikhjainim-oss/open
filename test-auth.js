// test-auth.js
// Simple script to register a test user and then log in, printing responses.
// Uses native fetch (Node >=18). Ensure backend is running on http://localhost:4000.

(async () => {
  const base = 'http://localhost:4000';
  const email = 'testuser@example.com';
  const password = 'Password123!';
  const name = 'Test User';
  const phone = '1234567890';

  try {
    // Register
    const regRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'rider', name, phone })
    });
    const regBody = await regRes.text();
    console.log('REGISTER status', regRes.status);
    console.log('REGISTER body', regBody);
  } catch (e) {
    console.error('Register error', e);
  }

  try {
    // Login
    const logRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const logBody = await logRes.text();
    console.log('LOGIN status', logRes.status);
    console.log('LOGIN body', logBody);
  } catch (e) {
    console.error('Login error', e);
  }
})();
