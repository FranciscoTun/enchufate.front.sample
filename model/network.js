class NetworkConfig {
    constructor(namespacePrefix, certificateUrlBase, apiUrlBase, genoBankIoAddress) {
        this.namespacePrefix = namespacePrefix;
        this.certificateUrlBase = certificateUrlBase;
        this.apiUrlBase = apiUrlBase;
        this.genoBankIoAddress = genoBankIoAddress;
        
        // Validation (equivalent to __post_init__)
        this._validateUrls();
    }

    _validateUrls() {
        try {
            new URL(this.certificateUrlBase);
            new URL(this.apiUrlBase);
        } catch (error) {
            throw new Error("URI base error");
        }
    }
}

class Network {
    static LOCAL = new NetworkConfig(
        "io.genobank.test",
        window.CERTIFICATE_VERIFIER_URL_BASE,
        "https://api-test.genobank.io/",
        "0x795faFFc58648e435E3bD3196C4F75F8EFc4b306"
    );

    static TEST = new NetworkConfig(
        "io.genobank.test",
        window.CERTIFICATE_VERIFIER_URL_BASE,
        "https://api-test.genobank.io/",
        "0x795faFFc58648e435E3bD3196C4F75F8EFc4b306"
    );

    static PRODUCTION = new NetworkConfig(
        "io.genobank",
        window.CERTIFICATE_VERIFIER_URL_BASE,
        "https://api.genobank.io/",
        "0x633F5500A87C3DbB9c15f4D41eD5A33DacaF4184"
    );
}