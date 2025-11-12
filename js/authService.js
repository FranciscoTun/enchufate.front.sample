async function setInstitutionCookie() {
    await fetch('https://api-enchufate-staging.duckdns.org/institutions/setdocxauth', {
    method: 'GET',
    credentials: 'include'
    });
}
