let data = null;
let taxonomy = null;
var userLang = navigator.language || navigator.userLanguage;

var defaultLanguage = null;
var stringLanguage = null;

defaultLanguage = $(userLang.split('-'));
stringLanguage = defaultLanguage[0];

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  }));

const toBuffer = url => fetch(url)
  .then(response => response.blob())
  .then(blob => blob.arrayBuffer());

$(async function () {
  if (stringLanguage != 'en' || stringLanguage != 'zh' || stringLanguage != 'es' || stringLanguage != 'pt') {
    stringLanguage = 'en';
  }
  $('#resultOk').hide();
  setupLanguageButtons();
  taxonomy = new window.$genobank.LaboratoryProcedureTaxonomy();
  if (window.ENV === 'test') {
    $('#watermark').addClass('watermark');
  }
  if (await loadData()) {
    if (await verifyData()) {
      $('#loader').hide();
      $('#resultOk').show();
      await showData();
      loadAndShowLabData();
    }
  }
});

function setupLanguageButtons() {
  $("#translate-en").click(function () {
    $(".localized").hide();
    $(".en").show();
    $(".btn-translate").removeClass('active');
    $(this).addClass('active');
    stringLanguage = 'en';
    loadLocalizedData();
  });

  $("#translate-zh").click(function () {
    $(".localized").hide();
    $(".zh").show();
    $(".btn-translate").removeClass('active');
    $(this).addClass('active');
    stringLanguage = 'zh';
    loadLocalizedData();
  });

  $("#translate-pt").click(function () {
    $(".localized").hide();
    $(".pt").show();
    $(".btn-translate").removeClass('active');
    $(this).addClass('active');
    stringLanguage = 'pt';
    loadLocalizedData();
  });

  // $("#translate-tl").click(function () {
  //   $(".localized").hide();
  //   $(".tl").show();
  //   $(".btn-translate").removeClass('active');
  //   $(this).addClass('active');
  // });

  $("#translate-es").click(function () {
    $(".localized").hide();
    $(".es").show();
    $(".btn-translate").removeClass('active');
    $(this).addClass('active');
    stringLanguage = 'es';
    loadLocalizedData();
  });
}

async function showData() {
  new QRCode(document.getElementById("qrCode"), {
    text: location.href,
    width: 420,
    height: 420,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  $('#studentCode').html(data.permitteeRepresentation.studentCode);
  $('#idDocumentHash').html(data.permitteeRepresentation.idDocumentHash);
  $('#degreeProgram').html(data.permitteeRepresentation.degreeProgram);
  loadLocalizedData();
  $('#academicProgram').html(data.permitteeRepresentation.academicProgram || '/');

  const issueDate = formatLocalTime(data.permitteeRepresentation.emissionDate)
  $('#issueDate').html(issueDate);

  const graduationDate  = formatLocalTime(data.permitteeRepresentation.graduationDate)
  $('#graduationDate').html(graduationDate);
  const platformReadableTime = moment(data.platformData.timestamp.toISOString(), "YYYYMMDD T h:mm z").format('MMMM Do YYYY, hh:mm a');
  $('#platformTime').html(platformReadableTime);


  $('#universityCode').html(data.permitteeRepresentation.universityCode);
  $('#diplomaNumber').html(data.permitteeRepresentation.diplomaNumber);
  $('#academicDegree').html(data.permitteeRepresentation.academicDegree);
  $('#digitalDiplomaHash').html(data.permitteeRepresentation.digitalDiplomaHash);

  $('#rectorsSignature').html(`
    <img src="${data.permitteeRepresentation.rectorsSignature}" height="50px">

  `);

    $('#deansSignature').html(`
      <img src="${data.permitteeRepresentation.deansSignature}" height="50px">

  `);

      $('#generalSecretarySignature').html(`
    <img src="${data.permitteeRepresentation.generalSecretarySignature}" height="50px"></img>


  `);


  let txHtml = '';
  const avalancheTxLink = `https://cchain.explorer.avax-test.network/tx/${data?.certificate?.tx_hash}`;
  txHtml = `${txHtml}<a target="_blank" class="tx-primary" href="${avalancheTxLink}">${avalancheTxLink}</a>`;


  $('#tx').html(txHtml);
  $('#serializedData').html(serializePermitteeAndCertificateForHtml(data));
}

function loadLocalizedData() {
  $('#faculty').html(data.permitteeRepresentation.faculty);
  $('#studentDNI').html(data.permitteeRepresentation.studentDNI);
}

async function loadAndShowLabData() {
  let name = `${data.permitteeRepresentation.universityCode}`;
  let logo = '';
  data['labLogo'] = '';
  let legal_representative = '/';
  const profile = await getPermitteeProfile(data.permitteeRepresentation.universityCode);
  if (profile && !profile.errors) {
    try {
      if (profile.name) {
        name = `${profile.name}/${data.permitteeRepresentation.universityCode}`;
      }
      if (profile.logo) {
        data['labLogo'] = profile.logo;
        logo = `<img src="${profile.logo}" style="width: 100%; max-width: 100%;">`;
      }
      if (profile.legal_representative) {
        legal_representative = profile.legal_representative;
      }
    } catch (e) { }
  }
  data['institutionName'] = name;
  data['legalRepresentative'] = legal_representative;
  $('#laboratory').html(name);
  $('#logo').html(logo);
  $('#legalRepresentative').html(legal_representative);
  // hardcoded investigator (Legal representant)
  // $('#investigator').html("Dra. Jeri Ramón Ruffner de Vega");
}

async function verifyData() {
  const errors = [];

  console.log("data: ", data)

  if (data?.certificate?.status !== 'ACTIVE'){
    errors.push(`<span class="localized en"> <span class="text-danger"><i class="fa fa-times"></i> This certificate has been revoked.</span></span>`);
    errors.push(`<span class="localized zh"> <span class="text-danger"><i class="fa fa-times"></i> 此证书已被撤销。</span></span>`);
    errors.push(`<span class="localized pt"> <span class="text-danger"><i class="fa fa-times"></i> Este certificado foi revogado.</span></span>`);
    errors.push(`<span class="localized tl"> <span class="text-danger"><i class="fa fa-times"></i> यह प्रमाणपत्र रद्द कर दिया गया है।</span></span>`);
    errors.push(`<span class="localized es"> <span class="text-danger"><i class="fa fa-times"></i> Este certificado ha sido revocado.</span></span>`);
  }
  const addressPermittee = getPermitteeAddressFromSignature(data);
  if (!addressPermittee) {
    errors.push(`<span class="localized en"> <span class="text-danger"><i class="fa fa-times"></i> Certificate signature invalid.</span></span>`);
    errors.push(`<span class="localized zh"> <span class="text-danger"><i class="fa fa-times"></i> 证书签名无效。</span></span>`);
    errors.push(`<span class="localized pt"> <span class="text-danger"><i class="fa fa-times"></i> Firma del certificado inválido.</span></span>`);
    errors.push(`<span class="localized tl"> <span class="text-danger"><i class="fa fa-times"></i> प्रमाणपत्र हस्ताक्षर अमान्य है।</span></span>`);
    errors.push(`<span class="localized es"> <span class="text-danger"><i class="fa fa-times"></i> Assinatura do certificado inválida.</span></span>`);
  }
  const permittee = await getPermittee(data.permitteeSignature.permitteeSerial);
  if (permittee && !permittee.errors) {
    if (permittee.address !== addressPermittee && errors.length == 0) {
      errors.push(`<span class="localized en"> <span class="text-danger"><i class="fa fa-times"></i> Invalid laboratory signature or data.</span></span>`);
      errors.push(`<span class="localized zh"> <span class="text-danger"><i class="fa fa-times"></i> 无效的实验室签名或数据。</span></span>`);
      errors.push(`<span class="localized pt"> <span class="text-danger"><i class="fa fa-times"></i> Firma o datos de laboratorio no válidos.</span></span>`);
      errors.push(`<span class="localized tl"> <span class="text-danger"><i class="fa fa-times"></i> अमान्य प्रयोगशाला हस्ताक्षर या डेटा।</span></span>`);
      errors.push(`<span class="localized es"> <span class="text-danger"><i class="fa fa-times"></i> Assinatura ou dados laboratoriais inválidos.</span></span>`);
    }
  } else if (errors.length == 0) {
    errors.push(`<span class="localized en"> <span class="text-danger"><i class="fa fa-times"></i> Invalid signer.</span></span>`);
    errors.push(`<span class="localized zh"><span class="text-danger"><i class="fa fa-times"></i> 无效的签名者。</span></span>`);
    errors.push(`<span class="localized pt"><span class="text-danger"><i class="fa fa-times"></i> Firmante inválido.</span></span>`);
    errors.push(`<span class="localized tl"><span class="text-danger"><i class="fa fa-times"></i> अमान्य हस्ताक्षरकर्ता।</span></span>`);
    errors.push(`<span class="localized es"><span class="text-danger"><i class="fa fa-times"></i> Signatário inválido.</span></span>`);
  }
  // additional check could be if this address has a permittee token directly on blockchain.

  const address = getGenoBankioAddressFromSignature(data);
  console.log(address)
  if (!address && errors.length == 0) {
    errors.push(`<span class="localized en"><span class="text-danger"><i class="fa fa-times"></i> Certificate signature invalid.</span></span>`);
    errors.push(`<span class="localized zh"> <span class="text-danger"><i class="fa fa-times"></i>证书签名无效。</span></span>`);
    errors.push(`<span class="localized pt"><span class="text-danger"><i class="fa fa-times"></i> Firma del certificado inválido.</span></span>`);
    errors.push(`<span class="localized tl"><span class="text-danger"><i class="fa fa-times"></i> प्रमाणपत्र हस्ताक्षर अमान्य है।</span></span>`);
    errors.push(`<span class="localized es"><span class="text-danger"><i class="fa fa-times"></i> Assinatura do certificado inválida.</span></span>`);
  }

  // Additional check could be checking if genobankSignature signature was emitted in the txHash.
  if (address !== window.GENOBANK_ADDRESS && errors.length == 0) {
    errors.push(`<span class="localized en"><span class="text-danger"><i class="fa fa-times"></i> Certificate signature invalid.</span></span>`);
    errors.push(`<span class="localized zh"><span class="text-danger"><i class="fa fa-times"></i> 证书签名无效。</span></span>`);
    errors.push(`<span class="localized pt"><span class="text-danger"><i class="fa fa-times"></i> Firma del certificado inválido.</span></span>`);
    errors.push(`<span class="localized tl"><span class="text-danger"><i class="fa fa-times"></i> प्रमाणपत्र हस्ताक्षर अमान्य है।</span></span>`);
    errors.push(`<span class="localized es"><span class="text-danger"><i class="fa fa-times"></i> Assinatura do certificado inválida.</span></span>`);
  }

  if (data.procedureTime > data.timestamp && errors.length == 0) {
    errors.push(`<span class="localized en"><span class="text-danger"><i class="fa fa-times"></i> Certificate timestamp invalid.</span></span>`);
    errors.push(`<span class="localized zh"><span class="text-danger"><i class="fa fa-times"></i> 证书时间戳无效。</span></span>`);
    errors.push(`<span class="localized pt"><span class="text-danger"><i class="fa fa-times"></i> Certificado de marca de tiempo inválido.</span></span>`);
    errors.push(`<span class="localized tl"><span class="text-danger"><i class="fa fa-times"></i> प्रमाणपत्र टाइमस्टैम्प अमान्य है।</span></span>`);
    errors.push(`<span class="localized es"><span class="text-danger"><i class="fa fa-times"></i> Carimbo de data / hora do certificado inválido.</span></span>`);
  }

  let html = '';
  if (errors.length > 0) {

    for (let i = 0; i < errors.length; i++) {
      html = `
          ${html}
          ${errors[i]}
        `
    }

    $('#validationResult').html(html);
    return false;
  } else {
    $(document).ready(function(){
      if(stringLanguage.length) {
        $(".localized").hide();
        $('.' + stringLanguage).show();
        $(".btn-translate").removeClass('active');
        $('#translate-' + stringLanguage).addClass('active');
      } else {
        $(".localized").hide();
        $(".en").show();
        $(".btn-translate").removeClass('active');
        $('#translate-en').addClass('active');
      } 
    });
    $('#carouselExampleFade').show();
    return true;
  }
}

async function loadData() {
  const splitUrl = location.href.split('#')
  if (splitUrl.length == 2) {
    // console.log(splitUrl);
    data = await decodeCertificateUriData(splitUrl[1], taxonomy);
    data["certificate"] = await getCertificates(data.platformData.txHash);
    if (!data) {
      invalidDataError();
      return false;
    }
  } else {
    invalidDataError();
    return false;
  }
  return true;
}

function invalidDataError() {
  $('#invalidData').modal('show');
}

/**
 * Generates pdf from data.
 * @param data Data to generate pdf from.
 */
async function generatePdf() {
  const logo = await toDataURL('./assets/akdemic-logo-certification.jpg');
  const divider = await toDataURL('./assets/pdf-divider.png');
  const roboto = await toBuffer('./assets/Roboto-Regular.ttf');
  let demo = window.ENV === 'test' ? await toDataURL('./assets/demo.jpeg') : null;

  const doc = new PDFDocument({
    margins: { top: 60, bottom: 60, left: 40, right: 40 }
  });

  const stream = doc.pipe(blobStream());
  
  // Función helper para labels y texto
  const addField = (label, value, y) => {
    doc.font(roboto).fontSize(9).fillColor('#666').text(label, 40, y);
    doc.fontSize(14).fillColor('black').text(value, 40, y + 13, { width: 330 });
  };

  console.log("data", data)

  // Header
  doc.font(roboto);
  if (data.labLogo && data.labLogo !== '') {
    const institutionConstLogo = await imageToBase64(data.labLogo)
    doc.image(institutionConstLogo, 450, 40, { width: 120 });
  }

  // we need to change this, because this two lines are hardcoded using the university logo
  // const institutionConstLogo = await imageToBase64("img/UNMSM.png")
  // doc.image(institutionConstLogo, 400, 40, { width: 170 });

  const graduationTime = moment(data.permitteeRepresentation.graduationDate.toISOString())
    .format('YYYY-MM-DD HH:mm (UTC Z)');
  const platformTime = moment(data.platformData.timestamp.toISOString())
    .format('YYYY-MM-DD HH:mm (UTC Z)');

  // Campos principales
  addField('Código del Alumno / Student Code', data.permitteeRepresentation?.studentCode, 40);
  addField('Nombre de Carrera / Degree Program', data.permitteeRepresentation?.degreeProgram, 87);
  addField('Código de Universidad / University Code', data.permitteeRepresentation?.universityCode, 134);
  addField('Grado Académico / Academic Degree', data.permitteeRepresentation?.academicDegree, 181);
  addField('Número de Diploma / Diploma Number', data.permitteeRepresentation?.diplomaNumber, 228);
  addField('Fecha de Egreso/ Graduation Date', graduationTime, 275);
  addField('Fecha de Emisión / Platform Timestamp', platformTime, 322);

  // Divider y demo
  doc.image(divider, 0, 394, { height: 2 });
  if (demo) {
    doc.image(demo, 340, 200, { width: 244, height: 169 });
  }

  // Información de la universidad
  addField('Institución / Institution', data.institutionName, 440);
  // addField('Lab Director / Investigator', "Dra. Jeri Ramón Ruffner de Vega", 487);
  addField('Representante Legal / Legal Representative', data.legalRepresentative, 487);

  // Sección de Facts
  doc.fontSize(11).fillColor('#666').text('FACTS', 40, 524);
  doc.fontSize(9).text('Blockchain data', 40, 539);
  
  doc.font('Courier').fontSize(10);
  const factsData = [
    { color: 'gray', text: `V1=${data.getNamespace()}|` },
    { color: '#e83e8c', text: `${data.permitteeRepresentation.universityCode}|` },
    { color: '#e83e8c', text: `${data.permitteeRepresentation.studentCode}|` },
    { color: '#e83e8c', text: `${data.permitteeRepresentation.idDocumentHash}|`},
    { color: '#e83e8c', text: `|${data.permitteeRepresentation.degreeProgram}|` },
    { color: '#e83e8c', text: `${data.permitteeRepresentation.emissionDate.getTime()}` },
    { color: '#e83e8c', text: `${data.permitteeRepresentation.graduationDate.getTime()}` },
    { color: 'gray', text: `=${data.permitteeRepresentation.graduationDate.toISOString()}` },
    { color: '#e83e8c', text: `${data.permitteeRepresentation.diplomaNumber}|`},
    { color: 'gray', text: `=${data.permitteeRepresentation.academicDegree}` },
    { color: '#e83e8c', text: `|${data.permitteeRepresentation.digitalDiplomaHash}|` },
    { color: '#e83e8c', text: `${data.platformData.timestamp.getTime()}` },
    { color: 'gray', text: `=${data.platformData.timestamp.toISOString()}|` },
    { color: '#e83e8c', text: `${data.platformData.signature}` },
    { color: '#e83e8c', text: `|${data.platformData.txHash}` }
  ];

  doc.text('', 40, 560, { width: 380, height: 130, continued: true });
  factsData.forEach(({ color, text }) => {
    doc.fillColor(color).text(text, { continued: true });
  });

  // Copyright y logo
  doc.font(roboto).fontSize(9).fillColor('#666')
    .text('© GenoBank.io', 40, 750);
  doc.image(logo, 450, 440, { width: 120 });

  // QR Code
  doc.fontSize(12).fillColor('black')
    .text('Scan to verify authenticity and expiration date:', 450, 500, { width: 120 });
  const qrcode = document.getElementById("qrCode");
  const img = qrcode.getElementsByTagName('img');
  doc.image(img[0].src, 450, 550, { width: 120 });

  // Segunda página
  // doc.addPage();
  doc.fontSize(9).fillColor('#666').text('MORE INFORMATION', 40, 680);
  doc.fontSize(12).fillColor('blue');
  const infoText = 'U.S. CDC Passenger Disclosure and Attestation to the United States of America';
  doc.text(infoText, 40, 693);
  const width = doc.widthOfString(infoText);
  const height = doc.currentLineHeight();
  doc.underline(40, 693, width, height, { color: 'blue' })
    .link(40, 693, width, height, 'https://genobank.io/certificates/more-information/us-cdc-passenger-disclosure.pdf');

  // Finalizar y descargar
  doc.end();
  stream.on('finish', function () {
    const blob = stream.toBlob('application/pdf');
    const d = data.permitteeRepresentation.emissionDate;
    const datestring = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fileName = `${datestring} ${data.permitteeRepresentation?.studentCode}.pdf`;
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  });
}

async function imageToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(new Error(`Error al cargar la imagen: ${url}`));
    };
    img.src = url;
  });
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}



function formatLocalTime(dateInput) {
  return moment
    .utc(dateInput.toISOString())
    .local()
    // .format("DD/MMM/YYYY HH:mm (UTC Z)");
    .format("DD MMM YYYY");
}

function formatLocalTimeWithHours(dateInput) {
  const now = new Date();
  const hours = (Math.abs(now.getTime() - dateInput.getTime()) / 36e5).toFixed(1);
  const formatted = moment
    .utc(dateInput.toISOString())
    .local()
    .format("YYYY-MM-DD HH:mm (UTC Z)");
  return { formatted, hours };
}

function formatPlatformTime(dateInput) {
  return moment(dateInput.toISOString())
    .format("MMMM Do YYYY, hh:mm a");
}