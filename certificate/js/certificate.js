/**
 * @dev Pretty serialization of data. Includes colors.
 * Example: =io.genobank.certificates.v1.permittee-certification|DANIEL FRANCISCO URIBE BENITEZ|MX/320491837|1=COVID-19/PCR|N=NEGATIVE/SAFE||1611517330=2021-01-24T07:42Z
 * @param data Data to serialize.
 */
 let elements_added = 5
 function serializePermitteeAndCertificateForHtml(data) {
   return [
     `<span class="text-muted">V1=${data.getNamespace()}|</span>`,
     `${data.permitteeRepresentation.universityCode}|`,
     `${data.permitteeRepresentation.studentCode}|`,
     `${data.permitteeRepresentation.idDocumentHash}|`,
     `${data.permitteeRepresentation.degreeProgram}|`,
     `${data.permitteeRepresentation.emissionDate.getTime()}<span class="text-muted">=${data.permitteeRepresentation.emissionDate.toISOString()}</span>|`,
     `${data.permitteeRepresentation.graduationDate.getTime()}<span class="text-muted">=${data.permitteeRepresentation.graduationDate.toISOString()}</span>|`,
     `${data.permitteeRepresentation.diplomaNumber}|`,
     `${data.permitteeRepresentation.academicDegree}|`,
     `${data.permitteeRepresentation.digitalDiplomaHash}|`,
     `${data.permitteeSignature.signature}|`,
     `${data.platformData.timestamp.getTime()}<span class="text-muted">=${data.platformData.timestamp.toISOString()}</span>|`,
     `${data.platformData.signature}|`,
     `${data.platformData.txHash}`,
   ].join('');
 }
 
/**
 * Decodes URL data.
 * @param  data Data from url (after #).
 * @param procedures LaboratoryProcedureTaxonomy data so we can decode friendly data versions.
 */
async function decodeCertificateUriData(data, taxonomy) {
  try {
    let params = decodeURIComponent(data);
    if (params) {
      const values = params.split('|');
      if (values.length != 17) {
        return null;
      } else {
        let network = null;
        if (window.ENV === 'main') {
          network = new window.$genobank.Network(1); // production
        } else {
          network = new window.$genobank.Network(0); // test
        }
        const platformData = {
          txHash: values[10 + elements_added],
          signature: values[9 + elements_added],
          timestamp: new Date(parseInt(values[8 + elements_added])),
          hash: '',
          cert_id: values[16]
        };
        const permitteeRepresentation = {
          network,
          universityCode: values[0],
          studentCode: values[1],
          idDocumentHash: values[2],
          degreeProgram: values[3],
          emissionDate: new Date(parseInt(values[4])),
          graduationDate: new Date(parseInt(values[5])),
          diplomaNumber: values[6],
          academicDegree: values[7],
          digitalDiplomaHash: values[8],
          rectorsSignature: values[9],
          deansSignature: values[10],
          generalSecretarySignature: values[11],
          namespaceSuffix: ".certificates.v1.permittee-certification"
        }
        let serialization = await getFullSerialization(permitteeRepresentation);
        const permitteeSignature = {
          signature: values[12],
          claim: getClaim(serialization),
          permitteeSerial: values[0]
        };
        const certificate = new window.$genobank.NotarizedCertificate(permitteeRepresentation, permitteeSignature, platformData);
        return certificate;
      }
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

function getPermitteeAddressFromSignature(data) {
  try {
    const msgHashBytesPermittee = ethers.utils.arrayify(data.permitteeSignature.claim);
    const pubKeyPermittee = ethers.utils.recoverPublicKey(msgHashBytesPermittee, data.permitteeSignature.signature);
    return ethers.utils.computeAddress(pubKeyPermittee);
  } catch (e) {
    return null;
  }
}

function getGenoBankioAddressFromSignature(data) {
  try {
    const serializedData = data.getPlatformFullSerialization();
    const msgHash = ethers.utils.hashMessage(serializedData);
    const msgHashBytes = ethers.utils.arrayify(msgHash);
    const pubKey = ethers.utils.recoverPublicKey(msgHashBytes, data.platformData.signature);
    return ethers.utils.computeAddress(pubKey);
  } catch (e) {
    console.log(e);
    return null;
  }
}


async function getFullSerialization(permitteeRepresentation){
    return [
      permitteeRepresentation.network.namespacePrefix+permitteeRepresentation.namespaceSuffix,
      permitteeRepresentation.universityCode,
      permitteeRepresentation.studentCode,
      permitteeRepresentation.idDocumentHash,
      permitteeRepresentation.degreeProgram,
      permitteeRepresentation.emissionDate.toISOString(),
      permitteeRepresentation.graduationDate.toISOString(),
      permitteeRepresentation.diplomaNumber,
      permitteeRepresentation.academicDegree,
      permitteeRepresentation.digitalDiplomaHash,
      permitteeRepresentation.rectorsSignature,
      permitteeRepresentation.deansSignature,
      permitteeRepresentation.generalSecretarySignature
    ].join('|');
}

function getClaim(serialization){
  return ethers.utils.hashMessage(serialization)
}