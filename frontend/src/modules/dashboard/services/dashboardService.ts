// src/modules/dashboard/services/dashboardService.ts
import { api } from "../../../config/api";

export const exportDashboardPDF = async () => {
  try {
    const response = await api.get('/dashboard/export/pdf', {
      responseType: 'blob', // VITAL: Para manejar archivos binarios
    });
    
    // Crear un link invisible para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_RuTAB_${new Date().toLocaleDateString()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    // Si el backend mandó el BadRequestException, lo capturamos aquí
    if (error.response?.status === 400) {
      alert("Aviso de RuTAB: No hay actividad suficiente hoy para generar el PDF.");
    } else {
      console.error('Error inesperado:', error);
      alert("Ocurrió un error al intentar generar el reporte.");
    }
  }
};

export const exportDashboardCSV = (stats: any) => {
  if (!stats || (stats.rutasActivas === 0 && stats.pedidos.totales === 0)) {
    alert("⚠️ Aviso de RuTAB: No hay datos para exportar a CSV.");
    return;
  }

  // Definimos las columnas y los datos
  const headers = ["Categoria", "Valor"];
  const rows = [
    ["Rutas Activas", stats.rutasActivas],
    ["Total Pedidos", stats.pedidos.totales],
    ["Entregados", stats.pedidos.entregados],
    ["Fallidos", stats.pedidos.fallidos],
    ["En Ruta", stats.pedidos.enRuta],
    ["Incidencias Totales", stats.incidenciasHoy],
    ["Fecha Reporte", new Date().toLocaleString()]
  ];

  // Construimos el contenido CSV
  const csvContent = [
    headers.join(","),
    ...rows.map(e => e.join(","))
  ].join("\n");

  // Crear y descargar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Reporte_RuTAB_${new Date().toLocaleDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};