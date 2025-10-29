import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { ChatMessageDto, AnalyzeNeedsDto, RecommendWorkshopsDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  /**
   * Genera un saludo personalizado para el usuario
   * GET /ai-chat/greeting?platform=PitsApp
   */
  @Get('greeting')
  async getGreeting(@Query('platform') platform?: string) {
    const greeting = await this.aiChatService.generateGreeting(platform);
    return {
      success: true,
      greeting,
    };
  }

  /**
   * Genera sugerencias de talleres basadas en las necesidades del usuario
   * POST /ai-chat/suggest-workshops
   * Body: { message: "Necesito un taller para cambio de aceite en Medellín" }
   */
  @Post('suggest-workshops')
  async suggestWorkshops(@Body() body: { message: string }) {
    const suggestion = await this.aiChatService.generateWorkshopSuggestion(body.message);
    return {
      success: true,
      suggestion,
    };
  }

  /**
   * Genera sugerencias de repuestos basadas en las necesidades del usuario
   * POST /ai-chat/suggest-parts
   * Body: { message: "Necesito llantas para mi carro" }
   */
  @Post('suggest-parts')
  async suggestParts(@Body() body: { message: string }) {
    const suggestion = await this.aiChatService.generatePartsSuggestion(body.message);
    return {
      success: true,
      suggestion,
    };
  }

  @Post('message')
  async sendMessage(@Body() chatMessageDto: ChatMessageDto) {
    try {
      console.log('📨 Mensaje recibido:', chatMessageDto.message);
      
      const response = await this.aiChatService.chat(
        chatMessageDto.message,
        chatMessageDto.conversationHistory,
      );
      
      console.log('✅ Respuesta generada exitosamente');
      
      return {
        success: true,
        response,
      };
    } catch (error) {
      console.error('❌ Error en controller:', error);
      return {
        success: false,
        error: error?.message || 'Error procesando el mensaje',
      };
    }
  }

  @Post('analyze-needs')
  @UseGuards(JwtAuthGuard)
  async analyzeNeeds(@Body() analyzeNeedsDto: AnalyzeNeedsDto) {
    const analysis = await this.aiChatService.analyzeServiceNeeds(
      analyzeNeedsDto.description,
    );
    return {
      success: true,
      analysis,
    };
  }

  @Post('recommend-workshops')
  async recommendWorkshops(@Body() recommendDto: RecommendWorkshopsDto) {
    const recommendations = await this.aiChatService.recommendWorkshops(
      recommendDto.serviceType,
      recommendDto.location,
    );
    return {
      success: true,
      recommendations,
    };
  }
}
