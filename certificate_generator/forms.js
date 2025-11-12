const permitteeSigner = new Wallet();
const message = "I want to proceed."


let allCertificateUrls = [];



async function importWallet() {
    const fileInput = document.getElementById('id-keystore-file');
    const passwordInput = document.getElementById('id-password');
    const file = fileInput.files[0];
    if (!file) {
        alert('Select a file');
        return;
    }
    const password = passwordInput.value;
    if (!password) {
        alert('Enter password');
        return;
    }
    try {
        const encrypted = await file.text();
        const walletData = await permitteeSigner.decryptWallet(encrypted, password);
        permitteeSigner.importWallet(walletData.private_key)
        document.getElementById("id-wallet-address").innerHTML = permitteeSigner.account.address
        document.getElementById("id-certificate-generator-workspace").style.display = "block";
        
        
    } catch (error) {
        alert('Wrong password or file');
        console.error(error);
    }
}

function generateMetadata(){
    const fixedData = {
        "university_code": getCookie('DOCXAUTH'),
    };

    console.log("fixed data", fixedData)
    let quantity = parseInt(document.getElementById('id-metadata-quantity-input').value)
    if (quantity > 300){
        quantity = 300
        document.getElementById('id-metadata-quantity-input').value = 300
    }
    certificatesMockList = window.generateFixtureMetadata(quantity, fixedData);
    document.getElementById('id-certificate-metadata-textarea').value = JSON.stringify(certificatesMockList, null, 4)
}

async function generateCertificateHandler() {
    $("#id-url-result").hide()
    const certificatesMockList = JSON.parse(document.getElementById('id-certificate-metadata-textarea').value )
    const start = performance.now();
    const batchSize = 300; 
    const totalCertificates = certificatesMockList.length;
    const totalBatches = Math.ceil(totalCertificates / batchSize);
    console.log(`Procesando ${totalCertificates} certificados en ${totalBatches} lotes de ${batchSize}`);
    allCertificateUrls = [];
    const startTotal = performance.now();
    for (let i = 0; i < totalCertificates; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = certificatesMockList.slice(i, i + batchSize);
        console.log(`\nProcesando lote ${batchNumber}/${totalBatches} (${batch.length} certificados)...`);
        try {
            const certificateUrlList = await generateCertificateBatch(batch);
            allCertificateUrls.push(...certificateUrlList);
            
            console.log(`Lote ${batchNumber} completado. Total procesado: ${allCertificateUrls.length}/${totalCertificates}`);
        } catch (error) {
            console.error(`Error en lote ${batchNumber}:`, error);
        }
    }
    const endTotal = performance.now();
    const totalTime = ((endTotal - startTotal) / 1000).toFixed(2);
    const avgTimePerCert = totalCertificates > 0 ? ((endTotal - startTotal) / totalCertificates).toFixed(2) : 0;
    console.log(`\nProceso completado!`);
    console.log(`Total certificados: ${allCertificateUrls.length}`);
    console.log(`Tiempo total: ${totalTime} segundos`);
    console.log(`Tiempo promedio por certificado: ${avgTimePerCert} ms`);
    displayResults(allCertificateUrls); 
    const end = performance.now(); 
    console.log(`La ejecución tardó ${end - start} milisegundos.`);
    return allCertificateUrls;
}

function displayResults(certificateUrlList) {
    $("#id-url-result").show()
    const resultDiv = document.getElementById("id-url-result");
    if (certificateUrlList.length === 0) {
        resultDiv.innerHTML = '<p>Certificates not created</p>';
        return;
    }
    let html = `<h3>${certificateUrlList.length} certificates created</h3>`;
    html += '<p>To view the URLs, download the text file.</p>';
    html += '<button class="btn btn-success" onclick="downloadAllUrls()">Download all URLs</button>';
    resultDiv.innerHTML = html;
}

function downloadAllUrls() {
    const urlsToDownload = allCertificateUrls; 
    if (urlsToDownload.length === 0) {
        alert('No hay URLs de certificados para descargar.');
        return;
    }
    const blob = new Blob([urlsToDownload.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate-urls.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function generateCertificateBatch(certificatesList) {
    const start = performance.now();
    const representationsList = await getPermitteeRepresentationsList(certificatesList);
    const permitteeSignature = await permitteeSigner.signMessage(message);
    const permitteeSignatureList = representationsList.map(representation => {
        return representation.signature;
    });
    const metaTx = await getMetaTx(permitteeSigner.account.address, permitteeSignatureList);
    const metaTxSignature = await permitteeSigner.signMetaTransaction(
        metaTx?.emitter,
        message,
        metaTx?.nonce
    );
    const response = await createCertificateBatch(
        permitteeSigner.bytesToHex(permitteeSignature),
        metaTxSignature,
        message,
        representationsList,
        metaTx?.nonce
    );
    const end = performance.now();
    console.log(`Lote procesado en ${((end - start) / 1000).toFixed(2)} segundos`);
    return response?.data?.certificate_list || [];
}

async function getPermitteeRepresentationsList(metadataList) {
    const network = selectNetwork(window.NETWORK);
    const promisesList = metadataList.map(async metadataObject => {
        const representationsObject = {
            ...metadataObject,
            emission_time: new Date(metadataObject.emission_time),
            graduation_date: new Date(metadataObject.graduation_date)
        };
        const representations = new PermitteeRepresentations({
            ...representationsObject,
            network: network
        });
        const permitteeSignature = await permitteeSigner.signRepresentationsRaw(representations);
        representations.setSignature(permitteeSigner.bytesToHex(permitteeSignature));
        return representations;
    });
    const representationsList = await Promise.all(promisesList);
    return representationsList;
}

function selectNetwork(networkStr) {
    if (networkStr === "--local") {
        return Network.LOCAL;
    } else if (networkStr === "--test") {
        return Network.TEST;
    } else if (networkStr === "--production") {
        return Network.PRODUCTION;
    } else {
        throw new Error("You must specify --local, --test or --production network");
    }
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return undefined;
}