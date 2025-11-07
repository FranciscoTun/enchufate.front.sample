import { faker } from 'https://cdn.jsdelivr.net/npm/@faker-js/faker/+esm';

const createCertificateMetadata = () => {
    const year = faker.date.anytime().getFullYear();
    const degree = faker.helpers.arrayElement(['CIVIL', 'MECHA', 'ELECT']);
    const idNumber = faker.string.numeric(5, { allowLeadingZeros: true });

    return {
        "student_code": `${year}${degree}${idNumber}`,
        "university_code": faker.string.alphanumeric(25), 
        "id_document_hash": faker.string.hexadecimal({ length: 66, prefix: '' }),
        "degree_program": faker.helpers.arrayElement(["Ingeniería Informática", "Arquitectura", "Medicina", "Derecho"]),
        "emission_time": faker.date.future({ years: 1, refDate: new Date() }).getTime(),
        "graduation_date": faker.date.past({ years: 5, refDate: new Date() }).getTime(),
        "diploma_number": `UNI-${faker.date.past().getFullYear()}-${faker.string.numeric(6)}`,
        "academic_degree": faker.helpers.arrayElement(["Titulado", "Graduado", "Master"]),
        "digital_diploma_hash": faker.string.hexadecimal({ length: 66, prefix: '' }),
        "rectors_signature": faker.internet.url(),
        "deans_signature": faker.internet.url(),
        "general_secretary_signature": faker.internet.url(),
    };
};

window.generateFixtureMetadata = function(quantity = 1, fixedFields = {}) {
    const count = Math.max(1, parseInt(quantity) || 1);
    const generator = () => {
        const fakeData = createCertificateMetadata();
        return {
            ...fakeData,
            ...fixedFields 
        };
    };
    const metadataArray = Array.from({ length: count }, generator);
    const result = count === 1 ? metadataArray[0] : metadataArray;
    return result
};