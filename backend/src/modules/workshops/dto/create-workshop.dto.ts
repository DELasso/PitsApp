import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsOptional, 
  IsArray, 
  IsNumber, 
  Min, 
  Max, 
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  ArrayMinSize,
  ValidateIf
} from 'class-validator';

export class CreateWorkshopDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del taller es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción del taller es obligatoria' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description: string;

  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'La dirección no puede exceder 150 caracteres' })
  address: string;

  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'La ciudad no puede exceder 50 caracteres' })
  city: string;

  @IsString({ message: 'El barrio debe ser un texto' })
  @IsNotEmpty({ message: 'El barrio es obligatorio' })
  @MinLength(2, { message: 'El barrio debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El barrio no puede exceder 50 caracteres' })
  neighborhood: string;

  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^[\d\s\-\(\)\+]+$/, { message: 'El teléfono solo puede contener números, espacios y caracteres especiales (+, -, ())' })
  @Matches(/^\+?[\d]{10}/, { message: 'En Colombia, el teléfono debe contener exactamente 10 dígitos (pueden incluir +57 al inicio)' })
  phone: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsArray({ message: 'Los servicios deben ser un array' })
  @IsString({ each: true, message: 'Cada servicio debe ser un texto' })
  @ArrayMinSize(1, { message: 'Debes seleccionar al menos un servicio' })
  services: string[];

  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  latitude: number;

  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  longitude: number;

  @IsOptional()
  @IsString({ message: 'El sitio web debe ser un texto' })
  @Matches(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, { 
    message: 'El sitio web debe ser una URL válida (ej: https://ejemplo.com)' 
  })
  website?: string;

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @IsString({ each: true, message: 'Cada imagen debe ser un texto' })
  images?: string[];

  @IsOptional()
  @IsString({ message: 'El horario debe ser un texto' })
  @MaxLength(300, { message: 'El horario no puede exceder 300 caracteres' })
  workingHours?: string;

  @IsOptional()
  @IsArray({ message: 'Las especialidades deben ser un array' })
  @IsString({ each: true, message: 'Cada especialidad debe ser un texto' })
  specialties?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'La calificación debe ser un número' })
  @Min(0, { message: 'La calificación debe estar entre 0 y 5' })
  @Max(5, { message: 'La calificación debe estar entre 0 y 5' })
  rating?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El número de reseñas debe ser un número' })
  @Min(0, { message: 'El número de reseñas no puede ser negativo' })
  reviewCount?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}
