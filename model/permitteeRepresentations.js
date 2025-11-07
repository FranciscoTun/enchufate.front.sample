class PermitteeRepresentations {
    constructor({
        network,
        university_code,
        student_code,
        id_document_hash,
        degree_program,
        emission_time,
        graduation_date,
        diploma_number,
        academic_degree,
        digital_diploma_hash,
        rectors_signature,
        deans_signature,
        general_secretary_signature,
        signature,
        version_code = "V1",
        namespace_suffix = ".certificates.v1.permittee-certification"
    }) {
        this.network = network;
        this.university_code = university_code;
        this.student_code = student_code;
        this.id_document_hash = id_document_hash;
        this.degree_program = degree_program;
        this.emission_time = emission_time;
        this.graduation_date = graduation_date;
        this.diploma_number = diploma_number;
        this.academic_degree = academic_degree;
        this.digital_diploma_hash = digital_diploma_hash;
        this.rectors_signature = rectors_signature;
        this.deans_signature = deans_signature;
        this.general_secretary_signature = general_secretary_signature;
        this.version_code = version_code;
        this.namespace_suffix = namespace_suffix;
        this.platform_signature = null
        this._validate();
    }

    _validate() {
        if (this.network === null || this.network === undefined) {
            throw new Error("Network is required");
        }
        if (!/^[A-Z0-9-]+$/.test(this.student_code)) {
            throw new Error("Student code does not use required format");
        }
        const minTime = new Date(Date.UTC(2000, 0, 1));
        if (this.emission_time < minTime) {
            throw new Error("Issue date is too early (before year 2000)");
        }
    }

    getFullSerialization() {
        const isoEmissionDate = this.emission_time.toISOString();
        const isoGraduationDate = this.graduation_date.toISOString();
        
        return [
            this.network.namespacePrefix + this.namespace_suffix,
            String(this.university_code),
            this.student_code,
            this.id_document_hash,
            this.degree_program,
            isoEmissionDate,
            isoGraduationDate,
            String(this.diploma_number),
            this.academic_degree,
            this.digital_diploma_hash,
            this.rectors_signature,
            this.deans_signature,
            this.general_secretary_signature
        ].join("|");
    }

    getTightSerialization() {
        return [
            String(this.university_code),
            this.student_code,
            this.id_document_hash,
            this.degree_program,
            String(Math.floor(this.emission_time.getTime())),
            String(Math.floor(this.graduation_date.getTime())),
            String(this.diploma_number),
            this.academic_degree,
            this.digital_diploma_hash,
            this.rectors_signature,
            this.deans_signature,
            this.general_secretary_signature
        ].join("|");
    }

    setSignature (signature){
        this.signature = signature
    }

    async getClaim() {
        const messageStr = this.getFullSerialization();
        return await this._defunctHashMessage(messageStr);
    }

    async _defunctHashMessage(message) {
        const encoder = new TextEncoder();
        const prefix = "\x19Ethereum Signed Message:\n";
        const messageBytes = encoder.encode(message);
        const prefixedMessage = prefix + messageBytes.length + message;
        const prefixedBytes = encoder.encode(prefixedMessage);
        if (typeof ethers !== 'undefined') {
            return ethers.utils.hashMessage(message);
        }
        throw new Error("ethers.js no está disponible. Incluye: <script src='https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js'></script>");
    }
}