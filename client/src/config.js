// client/src/config.js
const hostname = window.location.hostname;
const protocol = window.location.protocol;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

// Dynamic API URL that matches your current browser hostname
export const API_BASE_URL = isLocal 
  ? `${protocol}//${hostname}/Bee/server/api` 
  : `${window.location.origin}/server/api`;

// Dynamic Socket.IO URL derived from API_BASE_URL
const getSocketUrl = () => {
  try {
    const url = new URL(API_BASE_URL);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return `${url.protocol}//${url.hostname}:3000`;
  } catch (e) {
    return 'http://localhost:3000';
  }
};
export const SOCKET_URL = getSocketUrl();

export const STRIPE_CONFIG = {
  simulation: true
};
