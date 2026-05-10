// client/src/config.js
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

// If local, point to the XAMPP path. If live, use the relative path.
export const API_BASE_URL = isLocal 
  ? 'http://localhost/Bee/server/api' 
  : window.location.origin + '/server/api';

export const STRIPE_CONFIG = {
  simulation: true
};
