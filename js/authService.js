async function setInstitutionCookie() {
    const url = `${window.ENCHUFATE_API}/institutions/setdocxauth`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            const err = await response.json();
            throw err;
        }

        const data = await response.json();
        console.log("Server response:", data);

        return data;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
