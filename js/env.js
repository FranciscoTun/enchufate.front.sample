/**
 * Sets global configuration variables.
 */
(function() {
  window.NETWORK = '--local'
  window.CERTIFICATE_VERIFIER_URL_BASE = 'http://localhost:5500/front/certificate/verify-academic-transcript.html#'
  const test = true;
	window.test = test;
  window.ENV = test ? 'test' : 'main';
  window.API_BASE = test ? 'https://api-test.genobank.io' : 'https://api.genobank.io';
  window.GENOBANK_ADDRESS = test ? '0x43e50610CD5580a1cfbd3B27fe4d95449068c5D8' : '0x633F5500A87C3DbB9c15f4D41eD5A33DacaF4184';  
  window.ENCHUFATE_API = 'http://localhost:8081'
  window.MSG = "I want to proceed."
})();

/**
 * Draws a bar at the top of the webiste indicating when working in the testing
 * environment.
 */
(function() {
  if (window.ENV !== 'test') {
    return;
  } else {
    $([
      `<div style="display: block; background: red; padding: 16px 5px 16px 5px; text-align: center; color: white">`,
        `DEMO WEBSITE. This page is for testing our web server and page design.`,
      `</div>`
    ].join('')).prependTo($('body'));
  }
})();
