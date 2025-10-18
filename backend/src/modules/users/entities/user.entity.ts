export enum UserRole {
  CLIENTE = 'cliente',
  PROVEEDOR = 'proveedor',
}

export enum BusinessType {
  TALLER_MECANICO = 'taller_mecanico',
  VENTA_REPUESTOS = 'venta_repuestos',
  TALLER_Y_REPUESTOS = 'taller_y_repuestos',
}

export interface VehicleInfo {
  brand: string;
  model: string;
  year: number;
  plate: string;
  type?: string; // car, motorcycle, truck, etc.
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos específicos para proveedores
  companyName?: string;
  businessType?: BusinessType;
  address?: string;
  city?: string;
  description?: string;
  
  // Campos específicos para clientes
  dateOfBirth?: Date;
  vehicleInfo?: VehicleInfo;
}