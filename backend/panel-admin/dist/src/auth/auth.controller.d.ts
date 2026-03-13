import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        admin: {
            id: string;
            nombre: string;
            correo: string;
            rol: string;
            foto_perfil_url: string;
        };
    }>;
}
