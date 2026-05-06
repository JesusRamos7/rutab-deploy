// src/modules/dashboard/dashboard.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma/prisma.service';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Puerto del frontend
    methods: ['GET', 'POST'],
    credentials: true,
    transport: ['websocket'],
  },
  namespace: 'dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;


  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService
  ) { }

  @SubscribeMessage('requestInitialData')
  async handleInitialData(client: Socket) {
    await this.emitDashboardUpdate();
  }

  // Cuando un administrador se conecta, le enviamos la carga inicial
  async handleConnection(client: Socket) {
    console.log(`Admin conectado al Dashboard: ${client.id}`);
    await this.emitDashboardUpdate();
  }

  handleDisconnect(client: Socket) {
    console.log(`Admin desconectado: ${client.id}`);
  }

  /**
   * Método centralizado para emitir actualizaciones.
   * Se llama cada vez que algo cambia en la base de datos (pedidos, rutas, incidencias).
   */
  async emitDashboardUpdate() {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const incidencias = await this.prisma.incidencias.findMany({
      where: {
        created_at: {
          gte: inicioDia,
          lte: finDia,
        },
      },
      include: {
        rutas: {
          include: {
            vehiculos: true,
            administradores: true,
            choferes: true,
          }
        }
      }
    });

    // Clasificación de stats usando los nombres de campo correctos
    const stats = {
      urgentes: incidencias.filter(i => i.estado_incidencia === 'urgente').length,
      fallidos: incidencias.filter(i => i.categoria === 'entrega' || i.categoria === 'tiempo').length,
      alertasCriticas: incidencias.filter(i => i.categoria === 'camino').length,
      ...(await this.dashboardService.getDailyStats()),
    };

    const operacion = await this.dashboardService.getActiveOperations();

    this.server.emit('dashboard:update', {
      stats,
      operacion,
      rawIncidencias: incidencias, // Enviamos las incidencias sin procesar para que el frontend las clasifique
      timestamp: new Date(),
    });
  }
}