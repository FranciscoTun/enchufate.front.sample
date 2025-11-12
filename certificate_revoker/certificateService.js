async function getRevokeMetaTx(permitteeAddress) {
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


async function revokeCertificate(
    certId,
    permitteeAddress, 
    nonce, 
    metaTxSignature
) {
    const url = `${window.ENCHUFATE_API}/certificates/revoke`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                "cert_id":certId,
                "permittee_address":permitteeAddress,
                "nonce":nonce,
                "meta_tx_signature":metaTxSignature
            })
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

async function getAllCertificates(skip = 0, limit = 10) {
    const url = new URL(`${window.ENCHUFATE_API}/certificates/get_all`);
    url.searchParams.append("skip", skip);
    url.searchParams.append("limit", limit);
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