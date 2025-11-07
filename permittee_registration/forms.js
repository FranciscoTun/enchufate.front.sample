const wallet = new Wallet();
const messageToSign = "I want to proceed."


async function generateWallet() {
    try{
        const password = document.getElementById("id-new-password").value
        const walletData = await wallet.createWallet();
        const signature = await wallet.signMessage(messageToSign)
        const registered = await registerPermittee(signature, messageToSign)
        console.log("registered: ", registered)
        const encrypted = await wallet.encryptWallet(walletData, password);
        const filename = `wallet-${walletData.address.slice(0, 10)}.keystore`;
        const blob = new Blob([encrypted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }catch(e){
        console.error(e)
    }
}

async function importFromFile() {
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
        const wallet = new Wallet();
        const walletData = await wallet.decryptWallet(encrypted, password);
        wallet.importWallet(walletData.private_key)
        document.getElementById("id-imported-wallet").innerHTML = wallet.account.address
        document.getElementById("id-import-signer-section").style.display = "block";
    } catch (error) {
        alert('Wrong password or file');
        console.error(error);
    }
}