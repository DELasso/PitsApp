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
  type?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Campos específicos para proveedores
  companyName?: string;
  businessType?: BusinessType;
  address?: string;
  city?: string;
  description?: string;
  
  // Campos específicos para clientes
  vehicleInfo?: VehicleInfo;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  
  // Campos opcionales para proveedores
  companyName?: string;
  businessType?: BusinessType;
  address?: string;
  city?: string;
  description?: string;
  
  // Campos opcionales para clientes
  vehicleInfo?: VehicleInfo;
}