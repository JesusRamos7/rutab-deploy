// src/modules/monitoring/gateways/monitoring.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MonitoringService } from '../services/monitoring.service';
import { UpdateLocationDto } from '../dto/update-location.dto';

@WebSocketGateway({
  namespace: 'monitoring',
  cors: {
    origin: 'http://localhost:8081', // Puerto del frontend
    credentials: true,
  },
  transports: ['websocket'], // Forzamos solo websocket
})

export class MonitoringGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly monitoringService: MonitoringService) { }

    handleConnection(client: Socket) {
        console.log(`Cliente conectado: ${client.id}`);
    }

    @SubscribeMessage('updateLocation')
async handleUpdateLocation(@MessageBody() data: UpdateLocationDto) {
    await this.monitoringService.saveLocation(data);
    
    // Emitir a la habitación específica (para vistas de detalle de ruta)
    this.server.to(`route_${data.rutaId}`).emit('locationUpdate', data);
    
    // Emitir a TODOS
    this.server.emit('fleetUpdate', {
        rutaId: data.rutaId,
        latitud: data.latitud,
        longitud: data.longitud,
        velocidad: data.velocidad,
    });
}

    @SubscribeMessage('joinRoute')
    handleJoinRoute(
        @MessageBody('rutaId') rutaId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`route_${rutaId}`);
        console.log(`Cliente ${client.id} se unió al monitoreo de la ruta: ${rutaId}`);
        return { status: 'joined', room: `route_${rutaId}` };
    }
}