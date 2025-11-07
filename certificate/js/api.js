// NOTE: changes API_BASE to ENCHUFATE_API
async function getPermittee(institutionCode) {
  return fetch(`${window.ENCHUFATE_API}/permittees/get/${institutionCode}`, {
    method: 'GET',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
  }).then((res) => {
    return res.json();
  }).catch((e) => {
    return { errors: [{message: e }]};
  });
}

async function getPermitteeProfile(code) {
  return fetch(`${window.ENCHUFATE_API}/institutions/profile?code=${code}`, {
    method: 'GET',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
  }).then((res) => {
    return res.json();
  }).catch((e) => {
    return { errors: [{message: e }]};
  });
}

// NOTE: changes API_BASE to ENCHUFATE_API
async function getCertificates(txHash) {
  return fetch(`${window.ENCHUFATE_API}/certificates/get?tx_hash=${txHash}`, {
    method: 'GET',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
  }).then((res) => {
    return res.json();
  }).catch((e) => {
    return { errors: [{message: e }]};
  });
}


async function getStudentProfile(studenCode){
    return fetch(`${window.ENCHUFATE_API}/studentProfile?studentCode=${studenCode}`, {
    method: 'GET',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    }).then((res) => {
      return res.json();
    }).catch((e) => {
      return { errors: [{message: e }]};
    });
}