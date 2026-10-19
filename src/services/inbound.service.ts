import { VISOR_API_URL, getApiHeaders } from '../config/api';

const cache = new Map<string, any>();

export const InboundService = {
  getPreavisos: async (lineaNegocio: string) => {
    const cacheKey = `inbound-${lineaNegocio}`;
    
    // Petición a la API con cabecera de autenticación
    const [pendingRes, completedRes] = await Promise.all([
      fetch(`${VISOR_API_URL}/inbound/pending?lineaNegocio=${lineaNegocio}`, {
        headers: getApiHeaders()
      }),
      fetch(`${VISOR_API_URL}/inbound/completed?lineaNegocio=${lineaNegocio}`, {
        headers: getApiHeaders()
      })
    ]);

    const pendingData = await pendingRes.json();
    const completedData = await completedRes.json();

    let combinedData: any[] = [];
    if (pendingData.status === 'success' && Array.isArray(pendingData.data)) combinedData = [...combinedData, ...pendingData.data];
    if (completedData.status === 'success' && Array.isArray(completedData.data)) combinedData = [...combinedData, ...completedData.data];

    const flatData: any[] = [];
    combinedData.forEach((cab: any) => {
      if (cab.lineas && cab.lineas.length > 0) {
        cab.lineas.forEach((lin: any) => {
          flatData.push({ ...cab, ...lin });
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
      let badge = 'info';
      let status = item.estadoRecepcion;

      if (status === 'RECEPCION_CONFORME' || status === 'COMPLETADO' || status === 'APROBADO OL' || status === 'CONFIRMADO_OL_PENDIENTE_SAP') {
        status = 'APROBADO OL';
        badge = 'success';
      } else if (item.cantidad <= 0) {
        status = 'APROBADO OL';
        badge = 'success';
      }

      return {
        preAvisoId: item.numeroPreAviso,
        provider: item.rutProveedor,
        lineNo: item.posicionPedidoCompra,
        poNumber: item.numeroPedidoCompra,
        productCode: item.codigoProducto,
        batch: item.loteAvisado || item.lote || 'N/A',
        expDate: formatDate(item.fechaVencimientoAvisada || item.fechaExpiracion),
        receptionDate: formatDate(item.fechaRecepcionEst),
        rawReceptionDate: item.fechaRecepcionEst || '',
        qty: item.cantidadPendiente !== undefined ? item.cantidadPendiente : (item.cantidad !== undefined ? item.cantidad : Math.max(0, (item.cantidadAvisada || item.cantidadEsperada || 0) - (item.cantidadRecibida || 0))),
        qtyExpected: item.cantidadAvisada !== undefined ? item.cantidadAvisada : (item.cantidadEsperada || 0),
        qtyReceived: item.cantidadRecibida || 0,
        uom: 'Un.',
        status: status || (item.estadoFisico === 'COMPLETA' ? 'APROBADO OL' : 'PENDIENTE'),
        badge: badge,
        estadoFisico: item.estadoFisico
      };
    });

    cache.set(cacheKey, mappedData);
    return mappedData;
  },

  getCachedPreavisos: (lineaNegocio: string) => {
    return cache.get(`inbound-${lineaNegocio}`) || null;
  }
};
