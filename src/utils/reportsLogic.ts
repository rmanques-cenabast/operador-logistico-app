export const extractUniqueOptions = (adjustments: any[], activeLoB: string) => {
  const origins = new Set<string>();
  const destinations = new Set<string>();
  const materials = new Set<string>();

  adjustments.forEach(h => {
    const linea = h.Linea_Negocio ? String(h.Linea_Negocio).toUpperCase() : '';
    let matchesLob = false;
    if (activeLoB === 'TODOS') matchesLob = true;
    else if (activeLoB === 'INT') matchesLob = linea === 'CENABAST';
    else if (activeLoB === 'FP') matchesLob = linea !== 'CENABAST';

    if (matchesLob) {
      h.detalles?.forEach((d: any) => {
        if (d.Almacen_Origen) origins.add(d.Almacen_Origen);
        if (d.Almacen_Destino) destinations.add(d.Almacen_Destino);
        if (d.Codigo_Material) materials.add(d.Codigo_Material);
      });
    }
  });

  return {
    origins: Array.from(origins).sort(),
    destinations: Array.from(destinations).sort(),
    materials: Array.from(materials).sort()
  };
};

export const calculateDashboardMetrics = (adjustments: any[], filters: any) => {
  const { activeLoB, origin, destination, material, days, startDate, endDate } = filters;
  
  let cutoffStart: Date;
  let cutoffEnd: Date;

  if (startDate) {
    cutoffStart = new Date(startDate + 'T00:00:00');
  } else {
    cutoffStart = new Date();
    cutoffStart.setDate(cutoffStart.getDate() - ((days || 30) - 1));
    cutoffStart.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    cutoffEnd = new Date(endDate + 'T23:59:59');
  } else {
    cutoffEnd = new Date();
    cutoffEnd.setHours(23, 59, 59, 999);
  }

  let totalUnits = 0;
  const materialCounts: Record<string, number> = {};
  const routeCounts: Record<string, number> = {};
  
  // Data for chart (grouped by date)
  const chartDataMap: Record<string, number> = {};

  adjustments.forEach(h => {
    const linea = h.Linea_Negocio ? String(h.Linea_Negocio).toUpperCase() : '';
    let matchesLob = false;
    if (activeLoB === 'TODOS') matchesLob = true;
    else if (activeLoB === 'INT') matchesLob = linea === 'CENABAST';
    else if (activeLoB === 'FP') matchesLob = linea !== 'CENABAST';

    if (!matchesLob) return;

    const fechaObj = new Date(h.Fecha_Creacion);
    if (isNaN(fechaObj.getTime())) return;
    if (fechaObj < cutoffStart || fechaObj > cutoffEnd) return;
    
    const y = fechaObj.getFullYear();
    const m = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    h.detalles?.forEach((d: any) => {
      // Apply filters
      if (origin !== 'TODOS' && d.Almacen_Origen !== origin) return;
      if (destination !== 'TODOS' && d.Almacen_Destino !== destination) return;
      if (material !== 'TODOS' && d.Codigo_Material !== material) return;

      const qty = Math.abs(d.Cantidad || 0);
      totalUnits += qty;

      if (d.Codigo_Material) {
        materialCounts[d.Codigo_Material] = (materialCounts[d.Codigo_Material] || 0) + qty;
      }

      if (d.Almacen_Origen && d.Almacen_Destino) {
        let accion = 'TRASLADO';
        let cod = d.Tipo_Movimiento || 'N/A';
        if (d.Almacen_Origen === d.Almacen_Destino && d.Tipo_Movimiento) {
          const tipoMap: Record<string, string> = {
            '344': 'BLOQUEADO',
            '343': 'LIBRE UTILIZACION',
            '321': 'LIBRE UTILIZACION',
            '322': 'CONTROL DE CALIDAD',
            '311': 'TRASLADO'
          };
          accion = tipoMap[String(d.Tipo_Movimiento)] || 'ESTADO DESCONOCIDO';
        }
        let route = d.Almacen_Origen + '|' + d.Almacen_Destino + '|' + accion + '|' + cod;
        routeCounts[route] = (routeCounts[route] || 0) + qty;
      }

      chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + qty;
    });
  });

  // Calculate top material
  let topMaterial = { sku: '-', count: 0 };
  Object.entries(materialCounts).forEach(([sku, count]) => {
    if (count > topMaterial.count) topMaterial = { sku, count };
  });

  // Calculate top routes
  const topRoutes = Object.entries(routeCounts)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count);

  let topRoute = topRoutes.length > 0 ? topRoutes[0] : { route: '-', count: 0 };

  // Generate chart array
  const chartData = [];
  const startDay = new Date(cutoffStart);
  startDay.setHours(0, 0, 0, 0);
  const endDay = new Date(cutoffEnd);
  endDay.setHours(0, 0, 0, 0);

  const diffTime = Math.max(0, endDay.getTime() - startDay.getTime());
  const diffDays = Math.min(365, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  for (let i = 0; i < diffDays; i++) {
    const cur = new Date(startDay);
    cur.setDate(startDay.getDate() + i);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    chartData.push({
      name: cur.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      Unidades: chartDataMap[dateStr] || 0
    });
  }

  return {
    totalUnits,
    topMaterial,
    topRoute,
    topRoutes,
    chartData
  };
};