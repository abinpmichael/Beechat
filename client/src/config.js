// client/src/config.js
const hostname = window.location.hostname;
const protocol = window.location.protocol;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

// Dynamic API URL that matches your current browser hostname
export const API_BASE_URL = isLocal 
  ? `${protocol}//${hostname}/Bee/server/api` 
  : `${window.location.origin}/server/api`;

export const STRIPE_CONFIG = {
  simulation: true
};
