await fetch(`${window.ENCHUFATE_API}/institutions/setdocxauth`, {
  method: 'GET',
  credentials: 'include'
});

async function checkSession() {
  const resp = await fetch(`${window.ENCHUFATE_API}/session/me`, {
    method: 'GET',
    credentials: 'include'
  });
  if (resp.ok) return await resp.json();
  return null;
}
