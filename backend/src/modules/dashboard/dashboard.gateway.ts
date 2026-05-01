// src/modules/dashboard/dashboard.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DashboardService } from './dashboard.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', // Puerto del frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly dashboardService: DashboardService) {}

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
    const stats = await this.dashboardService.getDailyStats();
    const operacion = await this.dashboardService.getActiveOperations();
    
    this.server.emit('dashboard:update', {
      stats,
      operacion,
      timestamp: new Date(),
    });
  }
}