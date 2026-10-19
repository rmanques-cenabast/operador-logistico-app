import { API_URL, getApiHeaders } from '../config/api';

const OUTBOUND_API_URL = `${API_URL}/ol/outbound`;

export interface OutboundDelivery {
  IdEntrega: number;
  Numero_Entrega_SAP: string;
  Pedido_Venta_SAP: string;
  Destinatario: string;
  Direccion_Destino: string;
  Comuna: string;
  Ciudad: string;
  Prioridad: 'URGENTE' | 'ALTA' | 'NORMAL';
  Fecha_Creacion: string;
  Fecha_Compromiso: string;
  Estado: 'PENDIENTE_PICKING' | 'EN_PICKING' | 'PICKING_CONFIRMADO' | 'DTE_EMITIDO' | 'DESPACHADO';
  Folio_DTE: string | null;
  Estado_SAP: 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';
  Documento_SAP_PGI: string | null;
  Usuario_OL: string | null;
  Observaciones: string | null;
  Fecha_Picking: string | null;
  Fecha_Despacho: string | null;
  TotalItems: number;
  TotalCantidadSolicitada: number;
  TotalCantidadPickeada: number;
}

export interface OutboundItem {
  IdDetalle: number;
  IdEntrega: number;
  Posicion: number;
  Codigo_Material: string;
  Descripcion_Material: string;
  Cantidad_Solicitada: number;
  Cantidad_Pickeada: number;
  Unidad_Medida: string;
  Lote_SAP: string | null;
  Fecha_Vencimiento: string | null;
  Estado_Item: 'PENDIENTE' | 'PICKEADO';
}

export interface OutboundMetrics {
  PendientesPicking: number;
  EnPicking: number;
  PickingConfirmado: number;
  DespachadosTotal: number;
  Urgentes: number;
}

export const OutboundService = {
  getMetrics: async (): Promise<OutboundMetrics> => {
    const res = await fetch(`${OUTBOUND_API_URL}/metrics`, {
      headers: getApiHeaders()
    });
    const json = await res.json();
    return json.data || {
      PendientesPicking: 0,
      EnPicking: 0,
      PickingConfirmado: 0,
      DespachadosTotal: 0,
      Urgentes: 0
    };
  },

  getDeliveries: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    prioridad?: string;
    search?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status && params.status !== 'TODOS') query.set('status', params.status);
    if (params.prioridad && params.prioridad !== 'TODOS') query.set('prioridad', params.prioridad);
    if (params.search) query.set('search', params.search);

    const res = await fetch(`${OUTBOUND_API_URL}/deliveries?${query.toString()}`, {
      headers: getApiHeaders()
    });
    return await res.json();
  },

  getDeliveryById: async (id: number | string): Promise<OutboundDelivery & { lineas: OutboundItem[] }> => {
    const res = await fetch(`${OUTBOUND_API_URL}/deliveries/${id}`, {
      headers: getApiHeaders()
    });
    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Error al obtener detalle de entrega');
    }
    return json.data;
  },

  confirmPicking: async (id: number | string, items: Array<{
    idDetalle: number;
    cantidadPickeada: number;
    loteSap: string;
    fechaVencimiento?: string | null;
  }>, usuario: string = 'OPERADOR_BODEGA') => {
    const res = await fetch(`${OUTBOUND_API_URL}/deliveries/${id}/picking`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ items, usuario })
    });
    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Error al registrar pickeo');
    }
    return json;
  },

  syncFromSap: async (fechaDesde?: string, fechaHasta?: string) => {
    const params = new URLSearchParams();
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);

    const res = await fetch(`${OUTBOUND_API_URL}/sync-sap?${params.toString()}`, {
      method: 'POST',
      headers: getApiHeaders()
    });
    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Error al sincronizar con SAP');
    }
    return json;
  },

  dispatchToSap: async (id: number | string, usuario: string = 'SUPERVISOR_CENABAST') => {
    const res = await fetch(`${OUTBOUND_API_URL}/deliveries/${id}/dispatch-sap`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ usuario })
    });
    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Error al despachar a SAP');
    }
    return json;
  }
};
