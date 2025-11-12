async function setInstitutionCookie() {
    await fetch(`${window.ENCHUFATE_API}/institutions/setdocxauth`, {
    method: 'GET',
    credentials: 'include'
    });
}
