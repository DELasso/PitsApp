export enum UserRole {
  CLIENTE = 'cliente',
  PROVEEDOR = 'proveedor',
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
  businessType?: string;
  address?: string;
  city?: string;
  
  // Campos específicos para clientes
  dateOfBirth?: string;
  vehicleInfo?: string;
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
  businessType?: string;
  address?: string;
  city?: string;
  
  // Campos opcionales para clientes
  dateOfBirth?: string;
  vehicleInfo?: string;
}