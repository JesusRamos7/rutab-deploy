import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportService {
    async generateDailyPDF(data: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const chunks: any[] = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err) => reject(err));
                // --- ENCABEZADO ---
                doc.fontSize(20).text('RuTAB - REPORTE LOGÍSTICO DIARIO', { align: 'center' });
                doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
                doc.moveDown();

                // --- RESUMEN GENERAL (KPIs) ---
                doc.fontSize(14).text('Resumen de Operación', { underline: true });
                doc.fontSize(12).text(`Rutas Activas: ${data.rutasActivas}`);
                doc.text(`Total Pedidos: ${data.pedidos.totales}`);
                doc.text(`Entregados: ${data.pedidos.entregados}`);
                doc.text(`Fallidos: ${data.pedidos.fallidos}`);
                doc.moveDown();

                // --- INCIDENCIAS ---
                doc.fontSize(14).text('Bitácora de Incidencias', { underline: true });
                if (data.monitorIncidencias) {
                    doc.fontSize(10).text(`Críticas (Camino): ${data.monitorIncidencias.camino.length}`);
                    doc.text(`Gestión (Entrega): ${data.monitorIncidencias.entrega.length}`);
                }
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}