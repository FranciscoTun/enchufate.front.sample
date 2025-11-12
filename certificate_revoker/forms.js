const permitteeSigner = new Wallet();
const message = "I want to proceed."

const paginationState = {
    currentPage: 0,
    pageSize: 10,
    totalRecords: 0
};

let revokeModalInstance = null;
let currentRevokeCertId = null;

async function importWallet() {
    const fileInput = $('#id-keystore-file')[0];
    const password = $('#id-password').val();
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Select a file');
        return;
    }
    
    if (!password) {
        alert('Enter password');
        return;
    }
    
    try {
        const encrypted = await file.text();
        const walletData = await permitteeSigner.decryptWallet(encrypted, password);
        permitteeSigner.importWallet(walletData.private_key);
        
        $('#id-wallet-address').html(permitteeSigner.account.address);
        $('#id-certificate-generator-workspace').show();
        
        await loadCertificates();
        initializeRevokeModal();
    } catch (error) {
        alert('Wrong password or file');
    }
}

async function loadCertificates() {
    try {
        showLoader();
        
        const skip = paginationState.currentPage * paginationState.pageSize;
        const response = await getAllCertificates(skip, paginationState.pageSize);
        
        renderCertificatesTable(response.data);
        renderPaginationControls(response.pagination);
        
        hideLoader();
    } catch (error) {
        hideLoader();
    }
}

function renderCertificatesTable(certificates) {
    const $container = $('#id-certificates-container');
    
    if (!certificates || certificates.length === 0) {
        $container.html('<div class="alert alert-info">No certificates found</div>');
        return;
    }
    
    const tableHtml = /*html */`
        <div class="table-responsive">
            <table class="table table-hover table-bordered align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Degree Program</th>
                        <th>Student Code</th>
                        <th>Academic Degree</th>
                        <th>Diploma Number</th>
                        <th>Status</th>
                        <th>Graduation Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${certificates.map(cert => renderTableRow(cert)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    $container.html(tableHtml);
}

function renderTableRow(cert) {
    const statusClass = cert.status === 'ACTIVE' ? 'bg-success' : 'bg-danger';
    const formattedDate = new Date(cert.graduation_date).toLocaleDateString();
    
    return /*html */`
        <tr>
            <td><strong>${cert.degree_program}</strong></td>
            <td>${cert.student_code}</td>
            <td>${cert.academic_degree}</td>
            <td>${cert.diploma_number}</td>
            <td>
                <span class="badge ${statusClass}">${cert.status}</span>
            </td>
            <td>${formattedDate}</td>
            <td class="text-nowrap">
                <a href="${cert.url}" class="btn btn-primary btn-sm me-1" target="_blank">
                    View
                </a>
                <button class="btn btn-danger btn-sm" onclick="revokeHandler('${cert.cert_id}')">
                    Revoke
                </button>
            </td>
        </tr>
    `;
}

function renderPaginationControls(pagination) {
    const totalPages = Math.ceil(paginationState.totalRecords / paginationState.pageSize);
    const hasRecords = pagination.count > 0;
    
    const controlsHtml = /*html */`
        <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-3">
            <div class="d-flex align-items-center gap-2">
                <label class="mb-0">Show:</label>
                <select id="id-page-size-selector" class="form-select form-select-sm" style="width: auto;">
                    <option value="5" ${paginationState.pageSize === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${paginationState.pageSize === 10 ? 'selected' : ''}>10</option>
                    <option value="30" ${paginationState.pageSize === 30 ? 'selected' : ''}>30</option>
                    <option value="50" ${paginationState.pageSize === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${paginationState.pageSize === 100 ? 'selected' : ''}>100</option>
                </select>
                <span class="text-muted">records</span>
            </div>
            
            <div class="d-flex gap-2">
                <button id="id-prev-page" class="btn btn-sm btn-outline-secondary" 
                        ${paginationState.currentPage === 0 ? 'disabled' : ''}>
                    Previous
                </button>
                <span class="align-self-center px-3">
                    Page ${paginationState.currentPage + 1}
                </span>
                <button id="id-next-page" class="btn btn-sm btn-outline-secondary"
                        ${!hasRecords || pagination.count < paginationState.pageSize ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        </div>
    `;
    
    $('#id-pagination-controls').html(controlsHtml);
    attachPaginationEvents();
}

function attachPaginationEvents() {
    $('#id-page-size-selector').off('change').on('change', function() {
        paginationState.pageSize = parseInt($(this).val());
        paginationState.currentPage = 0;
        loadCertificates();
    });
    
    $('#id-prev-page').off('click').on('click', function() {
        if (paginationState.currentPage > 0) {
            paginationState.currentPage--;
            loadCertificates();
        }
    });
    
    $('#id-next-page').off('click').on('click', function() {
        paginationState.currentPage++;
        loadCertificates();
    });
}

function showLoader() {
    const loader = /*html */`
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    $('#id-certificates-container').html(loader);
}

function hideLoader() {
}

function initializeRevokeModal() {
    const modalElement = document.getElementById('id-revoke-modal');
    revokeModalInstance = new bootstrap.Modal(modalElement);
    
    $('#id-confirm-revoke').off('click').on('click', confirmRevocation);
}

function revokeHandler(certId) {
    currentRevokeCertId = certId;
    resetModalState();
    revokeModalInstance.show();
}

function resetModalState() {
    $('#id-revoke-progress').hide();
    $('#id-revoke-error').hide().text('');
    $('#id-confirm-revoke').prop('disabled', false);
    $('#id-cancel-revoke').prop('disabled', false);
}

async function confirmRevocation() {
    $('#id-confirm-revoke').prop('disabled', true);
    $('#id-cancel-revoke').prop('disabled', true);
    $('#id-revoke-progress').show();
    $('#id-revoke-error').hide();
    
    try {
        const revokeMetaTxData = await getRevokeMetaTx(permitteeSigner.account.address);
        const metaTXSignature = await permitteeSigner.signMetaTransaction(
            revokeMetaTxData?.emitter,
            currentRevokeCertId,
            revokeMetaTxData?.nonce
        );

        await revokeCertificate(
            currentRevokeCertId,
            permitteeSigner.account.address,
            revokeMetaTxData?.nonce,
            metaTXSignature
        );

        revokeModalInstance.hide();
        await loadCertificates();
    } catch (error) {
        handleRevocationError(error);
    }
}

function handleRevocationError(error) {
    $('#id-revoke-progress').hide();
    $('#id-confirm-revoke').prop('disabled', false);
    $('#id-cancel-revoke').prop('disabled', false);
    
    const errorMessage = error?.message || error?.text || 'An error occurred while revoking the certificate. Please try again.';
    $('#id-revoke-error').text(errorMessage).show();
}