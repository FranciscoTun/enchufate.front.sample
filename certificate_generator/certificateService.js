async function createCertificate(
    permitteeSignature, 
    platformSignature, 
    serializedRepresentations, 
    metaTxSignature, 
    representationsObject, 
    notarizedTimeMs, 
    nonce
) {
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



async function createCertificateBatch(
    permitteeSignature, 
    metaTxSignature, 
    signatureMessage, 
    representationsList, 
    nonce
) {
    const url = `${window.ENCHUFATE_API}/certificates/create_batch`;
    const certificate = { 
        "permittee_signature":permitteeSignature,
        "nonce":nonce,
        "meta_tx_signature":metaTxSignature,
        "signature_message":signatureMessage,
        "representations_list":representationsList
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


async function getMetaTx(permitteeAddress) {
    const url = `${window.ENCHUFATE_API}/certificates/get_certificate_meta_tx`;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                permittee_address: permitteeAddress
            })
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw errorResponse;
        }

        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
