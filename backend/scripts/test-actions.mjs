const base = 'http://127.0.0.1:3000';

const loginRes = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'secret123' }),
});

const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] ?? '';
const jsonHeaders = { cookie, 'Content-Type': 'application/json' };
const authHeaders = { cookie };

await fetch(`${base}/journal/2026-06-20/foods`, {
  method: 'POST',
  headers: jsonHeaders,
  body: JSON.stringify({ foodName: 'TestDelete', weightGrams: 100, caloriesPer100g: 100 }),
});

const day = await (await fetch(`${base}/journal/2026-06-20`, { headers: authHeaders })).json();
const foodId = day.foods.at(-1)?.id;
console.log('foodId', foodId);

const delRes = await fetch(`${base}/foods/${foodId}`, { method: 'DELETE', headers: authHeaders });
console.log('delete', delRes.status, await delRes.text());

const logoutRes = await fetch(`${base}/auth/logout`, { method: 'POST', headers: authHeaders });
console.log('logout', logoutRes.status, await logoutRes.text());

const meRes = await fetch(`${base}/auth/me`, { headers: authHeaders });
console.log('me after logout', meRes.status);
