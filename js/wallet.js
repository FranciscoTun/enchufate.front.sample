class Wallet {
    constructor() {
        this.account = null;
    }

    async createWallet() {
        const wallet = ethers.Wallet.createRandom();
        this.account = wallet;
        
        return {
            address: wallet.address,
            private_key: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase
        };
    }
    
    importWallet(credentials) {
        if (typeof credentials === 'string') {
            if (credentials.includes(' ')) {
                return this.loadFromMnemonic(credentials);
            } else {
                return this.loadFromPrivateKey(credentials);
            }
        }
        throw new Error('Credentials must be a string (mnemonic phrase or private key)');
    }
    
    loadFromPrivateKey(privateKey) {
        this.account = new ethers.Wallet(privateKey);
        return {
            address: this.account.address,
            private_key: this.account.privateKey
        };
    }
    
    loadFromMnemonic(mnemonic) {
        this.account = ethers.Wallet.fromPhrase(mnemonic);
        return {
            address: this.account.address,
            private_key: this.account.privateKey,
            mnemonic: this.account.mnemonic.phrase
        };
    }
    
    async signMessage(message) {
        if (!this.account) {
            throw new Error('No wallet loaded. Use importWallet first.');
        }
        return await this.account.signMessage(message);
    }
    
    async signTransaction(transaction) {
        if (!this.account) {
            throw new Error('No wallet loaded. Use importWallet first.');
        }
        return await this.account.signTransaction(transaction);
    }

    async signRepresentationsRaw(representations) {
        if (!this.account) {
            throw new Error('No wallet loaded. Use importWallet first.');
        }
        const messageStr = representations.getFullSerialization();
        const sigHex = await this.account.signMessage(messageStr);
        const sigBytes = ethers.getBytes(sigHex);
        return sigBytes;
    }

    async signRepresentationsHex(representations) {
        if (!this.account) {
            throw new Error('No wallet loaded. Use importWallet first.');
        }
        const messageStr = representations.getFullSerialization();
        const sigHex = await this.account.signMessage(messageStr);
        return sigHex;
    }

    bytesToHex(bytesSig) {
        return ethers.hexlify(bytesSig);
    }

    hexToBytes(hexSig) {
        return ethers.getBytes(hexSig);
    }

    async signMetaTransaction(contractAddress, proof, nonce) {
        if (!this.account) {
            throw new Error('No wallet loaded. Use importWallet first.');
        }

        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(proof));

        const messageHash = ethers.solidityPackedKeccak256(
            ["address", "bytes32", "uint256"],
            [contractAddress, dataHash, nonce]
        );

        const signatureHex = await this.account.signMessage(ethers.getBytes(messageHash));

        return signatureHex;
    }
    
    getAddress() {
        if (!this.account) {
            throw new Error('No wallet loaded.');
        }
        return this.account.address;
    }
    
    async encryptWallet(walletData, password) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const keyBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        
        const key = await crypto.subtle.importKey(
            'raw',
            keyBits,
            'AES-GCM',
            false,
            ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const plaintext = new TextEncoder().encode(JSON.stringify(walletData));
        
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            plaintext
        );
        
        const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
        
        return btoa(String.fromCharCode(...combined));
    }
    
    async decryptWallet(encryptedData, password) {
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const ciphertext = combined.slice(28);
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const keyBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        
        const key = await crypto.subtle.importKey(
            'raw',
            keyBits,
            'AES-GCM',
            false,
            ['decrypt']
        );
        
        const plaintext = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );
        
        return JSON.parse(new TextDecoder().decode(plaintext));
    }
}
