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
  const { activeLoB, origin, destination, material, days } = filters;
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

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
    if (fechaObj < cutoff) return;
    const dateStr = fechaObj.toISOString().split('T')[0];

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
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    chartData.push({
      name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
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