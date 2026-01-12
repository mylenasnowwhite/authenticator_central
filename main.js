// Código Google Apps Script para TOTP com múltiplos algoritmos
/***********************
 * CONFIGURAÇÃO
 ***********************/
const SECRETS = [
  // [nome, chave Base32, algoritmo (1=SHA1, 256=SHA256)]
  ["Google -   teste@gmail.com", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["Google - teste02@gmail.com", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["Google - teste03@gmail.com", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["Google - teste04@gmail.com", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["Meta Ads - teste@gmail.com", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["Bing Ads", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["RDStation", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["LinkedIn Ads", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1],
  ["TikTok Ads", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 1]
];

/***********************
 * BASE32 → BYTES
 ***********************/
function base32ToBytes(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  base32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");

  let bits = 0;
  let value = 0;
  const output = [];

  for (let i = 0; i < base32.length; i++) {
    const idx = alphabet.indexOf(base32[i]);
    if (idx === -1) throw new Error("Base32 inválido");

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return output;
}

/***********************
 * CONTADOR RFC 6238
 ***********************/
function getTimeCounterBytes() {
  const epoch = Math.floor(Date.now() / 1000);
  let counter = Math.floor(epoch / 30);

  const bytes = new Array(8).fill(0);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  return bytes;
}

/***********************
 * TOTP
 ***********************/
function generateTOTP(secret, algorithm = 1, digits = 6) {
  const cleanSecret = secret.replace(/\s/g, "").toUpperCase();

  if (!/^[A-Z2-7]+$/.test(cleanSecret)) {
    return "ERRO: Secret inválido";
  }

  const keyBytes = base32ToBytes(cleanSecret);
  const timeBytes = getTimeCounterBytes();

  let hmac;
  if (algorithm === 256) {
    hmac = Utilities.computeHmacSha256Signature(
      timeBytes,
      keyBytes
    );
  } else {
    hmac = Utilities.computeHmacSignature(
      Utilities.MacAlgorithm.HMAC_SHA_1,
      timeBytes,
      keyBytes
    );
  }

  const offset = hmac[hmac.length - 1] & 0x0f;

  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, "0");
}

/***********************
 * LISTAGEM
 ***********************/
function getTOTPs() {
  return SECRETS.map(([account, secret, algorithm]) => ({
    account,
    algorithm: algorithm === 256 ? "SHA256" : "SHA1",
    code: generateTOTP(secret, algorithm)
  }));
}

/***********************
 * TESTE COMPLETO
 ***********************/
function testAllKeys() {
  console.log("=== TESTE TOTP RFC 6238 ===");
  SECRETS.forEach(([account, secret]) => {
    console.log(account);
    console.log("  SHA1  :", generateTOTP(secret, 1));
    console.log("  SHA256:", generateTOTP(secret, 256));
    console.log("--------------------------");
  });
}

/***********************
 * ENDPOINT
 ***********************/
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
