import { useState, useEffect } from 'react';

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

export const useInventoryData = () => {
  const [adjustments, setAdjustments] = useState<AdjustmentHeader[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdjustments = (silent = false) => {
    if (!silent) setLoading(true);
    fetch('http://localhost:3000/api/v1/ol/inventory/adjustments?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setAdjustments(data.data.data || []);
        }
        if (!silent) setLoading(false);
      })
      .catch(err => {
        console.error("Error obteniendo ajustes:", err);
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdjustments();
    const intervalId = setInterval(() => fetchAdjustments(true), 3000);
    return () => clearInterval(intervalId);
  }, []);

  return { adjustments, loading, fetchAdjustments };
};
