export interface WarehouseInfo {
  code: string;
  name: string;
  linea: 'INT' | 'FP';
  description: string;
}

/**
 * Catálogo Oficial de Almacenes SAP - Centro 6000 (CENABAST)
 * - 6001 al 6015: Intermediación (Línea 22)
 * - 6101 al 6115: Farmacias Privadas (Línea 54)
 */
export const WAREHOUSES: Record<string, WarehouseInfo> = {
  // ==========================================
  // INTERMEDIACIÓN (Línea 22: 6001 - 6015)
  // ==========================================
  '6001': { code: '6001', name: 'Prod. Disp. Venta', linea: 'INT', description: 'Producto Disponible para Venta' },
  '6002': { code: '6002', name: 'Prod. Destrucción', linea: 'INT', description: 'Producto para Destrucción / Mermas' },
  '6003': { code: '6003', name: 'Prod. Deter. Imp', linea: 'INT', description: 'Producto Deteriorado Imputable' },
  '6004': { code: '6004', name: 'Prod. Corta Exp', linea: 'INT', description: 'Producto Corta Expiración' },
  '6005': { code: '6005', name: 'Faltante Picking', linea: 'INT', description: 'Faltante en Picking' },
  '6006': { code: '6006', name: 'Prod. Calidad', linea: 'INT', description: 'Control de Calidad / Donaciones' },
  '6007': { code: '6007', name: 'Prod. Deter/Falt', linea: 'INT', description: 'Producto Deteriorado / Faltante' },
  '6008': { code: '6008', name: 'Prod. Dev Client', linea: 'INT', description: 'Producto Devolución Cliente' },
  '6009': { code: '6009', name: 'Dev Client Rebot', linea: 'INT', description: 'Devolución Cliente Rebote' },
  '6010': { code: '6010', name: 'Prod. Ret Mercad', linea: 'INT', description: 'Producto Retiro de Mercado' },
  '6011': { code: '6011', name: 'Acond. Prod Entr', linea: 'INT', description: 'Acondicionamiento Producto Entrada' },
  '6012': { code: '6012', name: 'Acond. Prod Sali', linea: 'INT', description: 'Acondicionamiento Producto Salida' },
  '6013': { code: '6013', name: 'Insp. Rótulo', linea: 'INT', description: 'Inspección de Rótulo' },
  '6014': { code: '6014', name: 'Contramuestra Ac', linea: 'INT', description: 'Contramuestra Acondicionamiento' },
  '6015': { code: '6015', name: 'Reservado', linea: 'INT', description: 'Reservado Intermediación' },

  // ==========================================
  // FARMACIAS PRIVADAS (Línea 54: 6101 - 6115)
  // ==========================================
  '6101': { code: '6101', name: 'FI Disp. Venta', linea: 'FP', description: 'Farmacias Privadas Disponible para Venta' },
  '6102': { code: '6102', name: 'FI Destrucción', linea: 'FP', description: 'Farmacias Privadas Destrucción' },
  '6103': { code: '6103', name: 'FI Deter. Imp', linea: 'FP', description: 'Farmacias Privadas Deteriorado Imputable' },
  '6104': { code: '6104', name: 'FI Corta Exp', linea: 'FP', description: 'Farmacias Privadas Corta Expiración' },
  '6105': { code: '6105', name: 'FI Falt. Pick', linea: 'FP', description: 'Farmacias Privadas Faltante Picking' },
  '6106': { code: '6106', name: 'FI Control Cal', linea: 'FP', description: 'Farmacias Privadas Control de Calidad' },
  '6107': { code: '6107', name: 'FI Deter/Falt', linea: 'FP', description: 'Farmacias Privadas Deteriorado / Faltante' },
  '6108': { code: '6108', name: 'FI Dev Client', linea: 'FP', description: 'Farmacias Privadas Devolución Cliente' },
  '6109': { code: '6109', name: 'FI Dev Rebot', linea: 'FP', description: 'Farmacias Privadas Devolución Cliente Rebote' },
  '6110': { code: '6110', name: 'FI Ret Mercad', linea: 'FP', description: 'Farmacias Privadas Retiro Mercado' },
  '6111': { code: '6111', name: 'FI Acond Entr', linea: 'FP', description: 'Farmacias Privadas Acondicionamiento Entrada' },
  '6112': { code: '6112', name: 'FI Acond Sali', linea: 'FP', description: 'Farmacias Privadas Acondicionamiento Salida' },
  '6113': { code: '6113', name: 'FI Insp Rótulo', linea: 'FP', description: 'Farmacias Privadas Inspección Rótulo' },
  '6114': { code: '6114', name: 'FI Contramues', linea: 'FP', description: 'Farmacias Privadas Contramuestra' },
  '6115': { code: '6115', name: 'FI Reservado', linea: 'FP', description: 'Farmacias Privadas Reservado' }
};

export function getWarehouseInfo(code?: string | null): WarehouseInfo | null {
  if (!code) return null;
  const clean = String(code).trim();
  return WAREHOUSES[clean] || null;
}

export function getWarehouseLinea(code?: string | null): 'INT' | 'FP' | null {
  if (!code) return null;
  const num = parseInt(String(code).trim(), 10);
  if (num >= 6001 && num <= 6015) return 'INT';
  if (num >= 6101 && num <= 6115) return 'FP';
  return null;
}

export function isWarehouseInLinea(code: string | null | undefined, linea: 'INT' | 'FP'): boolean {
  if (!code) return false;
  return getWarehouseLinea(code) === linea;
}

export const WAREHOUSES_INTERMEDIACION: WarehouseInfo[] = Object.values(WAREHOUSES).filter(w => w.linea === 'INT');
export const WAREHOUSES_FARMACIAS: WarehouseInfo[] = Object.values(WAREHOUSES).filter(w => w.linea === 'FP');
