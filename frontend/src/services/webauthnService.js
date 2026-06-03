// src/services/webauthnService.js

import api from './api';

export function isWebAuthnSupported() {
  return (
    window.PublicKeyCredential &&
    navigator.credentials
  );
}

function generateChallenge() {
  return crypto.getRandomValues(new Uint8Array(32));
}

export async function registerBiometric(userId) {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: generateChallenge(),
      rp: {
        name: 'VoiceBank',
      },
      user: {
        id: new TextEncoder().encode(userId.toString()),
        name: userId.toString(),
        displayName: userId.toString(),
      },
      pubKeyCredParams: [
        {
          type: 'public-key', 
          alg: -7,
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
    },
  });

  const credentialId = btoa(
    String.fromCharCode(
      ...new Uint8Array(credential.rawId)
    )
  );

  // Kirim ke backend
  const response = await api.post('/auth/webauthn/register', {
    credential_id: credentialId
  });

  return response.data.success;
}

export async function authenticateBiometric() {
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: generateChallenge(),
      userVerification: 'preferred',
    },
  });

  if (!credential) {
    return false;
  }

  const credentialId = btoa(
    String.fromCharCode(
      ...new Uint8Array(credential.rawId)
    )
  );

  // Kirim ke backend untuk verifikasi
  const response = await api.post('/auth/webauthn/verify', {
    credential_id: credentialId
  });

  return response.data.verified;
}