const crypto = require('crypto');
require('dotenv').config();

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function cifrar(texto) {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, nonce);
  let cifrado = cipher.update(texto, 'utf8', 'base64');
  cifrado += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return {
    cifrado: cifrado + Buffer.from(authTag).toString('base64'),
    nonce: nonce.toString('base64')
  };
}

function descifrar(cifradoB64, nonceB64) {
  const nonce = Buffer.from(nonceB64, 'base64');
  const cifradoConTag = Buffer.from(cifradoB64, 'base64');
  const authTag = cifradoConTag.slice(-16);
  const cifrado = cifradoConTag.slice(0, -16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, nonce);
  decipher.setAuthTag(authTag);
  let descifrado = decipher.update(cifrado, 'base64', 'utf8');
  descifrado += decipher.final('utf8');
  return descifrado;
}

module.exports = { cifrar, descifrar };