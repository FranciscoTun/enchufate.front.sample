async function registerPermittee(permitteeSignature, message) {
    const url = `${window.ENCHUFATE_API}/permittees/create`;
    const permittee = { 
        "permittee_signature": permitteeSignature, 
        "message": message 
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(permittee)
        });
        
        if (!response.ok) {
            const errorResponse = await response.json();
            throw errorResponse;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}