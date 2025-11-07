const wallet = new Wallet();
const message = "I want to proceed."

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
        const walletData = await wallet.decryptWallet(encrypted, password);
        wallet.importWallet(walletData.private_key)
        document.getElementById("id-wallet-address").innerHTML = wallet.account.address
        document.getElementById("id-certificate-generator-workspace").style.display = "block";

        const certificates = await getAllCertificates()
        const certificatesDiv = renderCertificates(certificates)

        document.getElementById("id-certificates-container").innerHTML = certificatesDiv




    } catch (error) {
        alert('Wrong password or file');
        console.error(error);
    }
}

async function getAllGeneratedCertificates(){
    
}


function renderCertificates(certificatesList){
    return certificatesList.map(cert => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">${cert.degree_program}</h5>
                        <p class="card-text">
                            <strong>Student Code:</strong> ${cert.student_code}<br>
                            <strong>Academic Degree:</strong> ${cert.academic_degree}<br>
                            <strong>Diploma Number:</strong> ${cert.diploma_number}<br>
                            <strong>Institution Code:</strong> ${cert.institution_code}
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <span class="badge ${cert.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'} mb-2">
                            ${cert.status}
                        </span>
                        <br>
                        <small class="text-muted">
                            ${new Date(cert.graduation_date).toLocaleDateString()}
                        </small>
                    </div>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted font-monospace">
                        ID: ${cert.cert_id.substring(0, 20)}...
                    </small>
                    <div>
                        <a href="${cert.url}" class="btn btn-primary btn-sm me-2" target="_blank">
                            View Certificate
                        </a>
                        <button class="btn btn-danger btn-sm" onclick="revoke('${cert.cert_id}')">
                            Revoke
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}