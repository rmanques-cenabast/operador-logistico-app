import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export interface SapLog {
  IdLog: number;
  Modulo: string;
  Referencia_ID: number;
  Folio_Documento?: string;
  Fecha_Ejecucion: string;
  Estado: string;
  Payload_Enviado?: string;
  Respuesta_SAP?: string;
  Documento_Material_SAP?: string;
  Usuario_OL?: string;
}

export interface AdjustmentDetail {
  ID?: number;
  Cabecera_ID?: number;
  Codigo_Material: string;
  Lote_SAP: string;
  Cantidad: number;
  Motivo: string;
  Tipo_Movimiento: string;
  Numero_OC?: string;
  Posicion_OC?: number;
  Almacen_Origen?: string;
  Almacen_Destino?: string;
  StockOrigen?: string;
  StockDestino?: string;
}

export interface AdjustmentHeader {
  ID: number;
  Nro_Ajuste: string;
  Centro?: string;
  Usuario_OL: string;
  Linea_Negocio?: string;
  Fecha_Creacion: string;
  Estado_SAP?: string;
  Mensaje_Error_SAP?: string;
  Documento_SAP_Ref?: string;
  detalles: AdjustmentDetail[];
  logsSap?: SapLog[];
}

export const useInventoryData = (modulo?: string, limit: number = 25) => {
  const [adjustments, setAdjustments] = useState<AdjustmentHeader[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdjustments = async (silent = false) => {
    const startTime = Date.now();
    if (!silent) setLoading(true);
    try {
      const url = new URL(`${API_URL}/ol/inventory/adjustments`);
      url.searchParams.set('limit', String(limit));
      if (modulo) {
        url.searchParams.set('modulo', modulo);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setAdjustments(data.data.data || []);
      }
      if (!silent) {
        const elapsed = Date.now() - startTime;
        if (elapsed < 400) {
          await new Promise(resolve => setTimeout(resolve, 400 - elapsed));
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Error obteniendo ajustes:", err);
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchAdjustments(true);
      }
    }, 20000);
    return () => clearInterval(intervalId);
  }, [modulo, limit]);

  return { adjustments, loading, fetchAdjustments };
};
