async function createCertificate(permitteeSignature, platformSignature, serializedRepresentations, metaTxSignature, representationsObject, notarizedTimeMs, nonce) {
    const url = `${window.ENCHUFATE_API}/certificates/create`;
    const certificate = { 
        "permittee_signature":permitteeSignature,
        "platform_signature":platformSignature,
        "nonce":nonce,
        "serialized_representations":serializedRepresentations,
        "meta_tx_signature":metaTxSignature,
        "notarized_time_ms":notarizedTimeMs,
        "representations_object":representationsObject
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(certificate)
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


async function getRevokeMetaTx(permitteeSignature, message) {
    const url = new URL(`${window.ENCHUFATE_API}/certificates/get_create_certificate_meta_tx`);
    url.searchParams.append("permittee_signature", permitteeSignature);
    url.searchParams.append("message", message);
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw errorResponse;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}



async function getAllCertificates() {
    const url = new URL(`${window.ENCHUFATE_API}/certificates/get_all`);
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw errorResponse;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
