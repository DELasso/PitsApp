export enum UserRole {
  CLIENTE = 'cliente',
  PROVEEDOR = 'proveedor',
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
  businessType?: string;
  address?: string;
  city?: string;
  
  // Campos específicos para clientes
  dateOfBirth?: Date;
  vehicleInfo?: string;
}