/**
 * Configuración centralizada de endpoints de la API
 * Permite configurar VITE_API_BASE_URL y VITE_API_KEY en archivos .env para cambiar entre Local, Desarrollo y Producción
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://apiweb-dev.cenabast.cl/operador-logistico-api');
export const API_URL = `${API_BASE_URL}/api/v1`;
export const VISOR_API_URL = `${API_URL}/visor`;
export const API_KEY = import.meta.env.VITE_API_KEY || 'cenabast_admin_key_2024';

export const getApiHeaders = (extraHeaders: Record<string, string> = {}): HeadersInit => {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('cenabast_token') || sessionStorage.getItem('cenabast_token')) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Interceptor global para detectar respuestas 401 Unauthorized de IAM CENABAST
if (typeof window !== 'undefined' && !(window as any).__api_fetch_intercepted) {
  (window as any).__api_fetch_intercepted = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 401) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
      // Excluir endpoint de login para permitir mostrar error de credenciales incorrectas en el formulario
      if (!url.includes('/auth/login')) {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
    return response;
  };
}

