/**
 * Configuración centralizada de endpoints de la API
 * Permite configurar VITE_API_BASE_URL en archivos .env para cambiar entre Local, Desarrollo y Producción
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_URL = `${API_BASE_URL}/api/v1`;
