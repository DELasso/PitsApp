import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  conversationHistory?: { role: string; content: string }[];
}

export class AnalyzeNeedsDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class RecommendWorkshopsDto {
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
