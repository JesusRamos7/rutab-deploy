export interface Driver {
    id: string;
    nombre: string;
    licencia: string;
    correo: string;
    password: string;
    telefono: string;
    foto_perfil_url: string;
}

export interface DriverFormData {
    nombre: string;
    licencia: string;
    correo: string;
    password: string;
    telefono: string;
    foto_perfil_url: string;
}

export interface DriverProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    driver?: Driver | null;
}