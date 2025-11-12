async function setInstitutionCookie() {
  const url = `${window.ENCHUFATE_API}/institutions/setdocxauth`;
  const resp = await fetch(url, { method:'GET', credentials:'include' });
  if (!resp.ok) throw await resp.json();
  const data = await resp.json();

  if (data && data.value) {
    // guarda una cookie en el dominio del front para facilitar tests / navegación
    // path=/ para que sea válida en toda la app; max-age 30 días por ejemplo
    document.cookie = `DOCXAUTH=${encodeURIComponent(data.value)}; path=/; max-age=${60*60*24*30}`;
  }
  return data;
}
