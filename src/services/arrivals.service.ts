import { API_URL } from '../config/api';

const cache = new Map<string, any>();

export interface GetReceivedOrdersParams {
  lineaNegocio?: string;
  page?: number;
  limit?: number;
  search?: string;
  provider?: string;
  status?: string;
}

export interface PaginatedReceivedOrders {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const ArrivalsService = {
  getReceivedOrders: async (params: GetReceivedOrdersParams | string): Promise<PaginatedReceivedOrders> => {
    let lineaNegocio = 'FP';
    let page = 1;
    let limit = 25;
    let search = '';
    let provider = '';
    let status = '';

    if (typeof params === 'string') {
      lineaNegocio = params;
    } else if (params) {
      lineaNegocio = params.lineaNegocio || 'FP';
      page = params.page || 1;
      limit = params.limit || 25;
      search = params.search || '';
      provider = params.provider || '';
      status = params.status || '';
    }

    const query = new URLSearchParams();
    query.set('lineaNegocio', lineaNegocio);
    query.set('page', String(page));
    query.set('limit', String(limit));
    if (search.trim()) query.set('search', search.trim());
    if (provider && provider !== 'TODOS') query.set('provider', provider);
    if (status && status !== 'TODOS') query.set('status', status);

    const cacheKey = `arrivals-${query.toString()}`;
    
    const res = await fetch(`${API_URL}/ol/inbound/received?${query.toString()}`);
    const data = await res.json();

    if (data.status !== 'success' || !Array.isArray(data.data)) {
      return {
        orders: [],
        pagination: { page: 1, limit: 25, totalItems: 0, totalPages: 1 }
      };
    }

    const flatData: any[] = [];
    data.data.forEach((cab: any) => {
      if (cab.lineas && cab.lineas.length > 0) {
        cab.lineas.forEach((prod: any) => {
          flatData.push({ ...cab, ...prod });
        });
      } else {
        flatData.push({ ...cab });
      }
    });

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ', ');
    };

    const mappedData = flatData.map((item: any) => {
      const diff = (item.cantidadRecibidaTotal || 0) - (item.cantidadEsperada || 0);
      let status = 'COMPLETA';
      let badge = 'success';

      if (item.cantidadRecibidaTotal === 0 || !item.cantidadRecibidaTotal) {
        status = 'PENDIENTE';
        badge = 'warning';
      } else if (diff < 0) {
        status = 'PARCIAL';
        badge = 'info';
      } else if (diff > 0) {
        status = 'SOBRANTE';
        badge = 'info';
      }

      let sapStatus = 'SINC. PENDIENTE';
      let sapBadge = 'warning';
      if (item.estadoRecepcion === 'PROCESADO_SAP' || item.estadoRecepcion === 'PROCESADO') {
        sapStatus = 'SINCRONIZADO';
        sapBadge = 'success';
      } else if (item.estadoRecepcion === 'ERROR' || item.estadoRecepcion === 'FALLIDO') {
        sapStatus = 'SINC. FALLIDA';
        sapBadge = 'danger';
      } else if (item.estadoRecepcion === 'ESPERANDO_LIBERACION') {
        sapStatus = 'ESP. LIBERACIÓN';
        sapBadge = 'info';
      }

      const entregas = item.entregasParciales || [];
      const lotesSet = new Set(entregas.map((e: any) => e.lote).filter(Boolean));

      return {
        rowId: `${item.numeroPreAviso}-${item.codigoProducto}-${item.posicionPedidoCompra}`,
        id: item.numeroPreAviso,
        provider: item.rutProveedor,
        rut: item.rutProveedor,
        lineNo: item.posicionPedidoCompra,
        productCode: item.codigoProducto,
        poNumber: item.numeroPedidoCompra,
        loteEsperado: item.loteEsperado || '-',
        fechaExpEsperada: item.fechaVencimientoEsperada ? formatDate(item.fechaVencimientoEsperada) : '-',
        loteRecibido: entregas.length > 0 ? entregas[0].lote : '-',
        fechaExpRecibida: entregas.length > 0 && entregas[0].vencimiento ? formatDate(entregas[0].vencimiento) : '-',
        batch: entregas.length > 0 ? entregas[0].lote : (item.loteEsperado || '-'),
        expDate: entregas.length > 0 && entregas[0].vencimiento ? formatDate(entregas[0].vencimiento) : (item.fechaVencimientoEsperada ? formatDate(item.fechaVencimientoEsperada) : '-'),
        receptionDate: formatDate(item.fechaRecepcion),
        expectedQty: Number(item.cantidadEsperada),
        receivedQty: Number(item.cantidadRecibidaTotal || 0),
        uom: 'Un.',
        status: status,
        badge: badge,
        sapStatus: sapStatus,
        sapBadge: sapBadge,
        documentoSAP: item.documentoSAP,
        numeroEntregas: entregas.length,
        numeroLotes: lotesSet.size,
        almacenSAP: item.almacenSAP,
        historialEntregas: entregas
      };
    });

    const result = {
      orders: mappedData,
      pagination: data.pagination || {
        page,
        limit,
        totalItems: mappedData.length,
        totalPages: Math.max(1, Math.ceil(mappedData.length / limit))
      }
    };

    cache.set(cacheKey, result);
    return result;
  },

  getCachedReceivedOrders: (params: GetReceivedOrdersParams | string) => {
    const key = typeof params === 'string' ? `arrivals-lineaNegocio=${params}&page=1&limit=25` : `arrivals-${new URLSearchParams(params as any).toString()}`;
    return cache.get(key) || null;
  },

  getProviders: async (lineaNegocio: string): Promise<string[]> => {
    try {
      const res = await fetch(`${API_URL}/ol/inbound/received/providers?lineaNegocio=${lineaNegocio}`);
      const data = await res.json();
      return data.status === 'success' && Array.isArray(data.data) ? data.data : [];
    } catch {
      return [];
    }
  },

  getDocuments: async (poNumber: string, preAviso: string) => {
    const res = await fetch(`${API_URL}/ol/inbound/documents/po/${poNumber}/${preAviso}`);
    const data = await res.json();
    return data.status === 'success' ? data.data : [];
  },

  liberarSAP: async (numeroPreAviso: string) => {
    const res = await fetch(`${API_URL}/ol/inbound/received/${numeroPreAviso}/liberar`, { method: 'POST' });
    return await res.json();
  },

  getPoReleaseStatus: async (poNumber: string) => {
    const res = await fetch(`${API_URL}/ol/inbound/po/${poNumber}/release-status`);
    return await res.json();
  },

  adjuntarDocumentoASap: async (documentId: number) => {
    const res = await fetch(`${API_URL}/ol/inbound/documents/${documentId}/adjuntar-sap`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  }
};
