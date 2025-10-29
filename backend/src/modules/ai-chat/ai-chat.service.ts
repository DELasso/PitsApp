import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
// @ts-ignore - LangChain export issue
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
// @ts-ignore - LangChain export issue
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { langchainConfig } from '../../config/langchain.config';
import { WorkshopsService } from '../workshops/workshops.service';
import { PartsService } from '../parts/parts.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private chatModel: ChatOpenAI;
  private chatModelWithTools: any; // Modelo con tools bindeadas
  private tools: DynamicStructuredTool[];

  constructor(
    private readonly workshopsService: WorkshopsService,
    private readonly partsService: PartsService,
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {
    // Inicializar el modelo según el provider configurado
    if (langchainConfig.provider === 'openai' && langchainConfig.openaiApiKey) {
      this.chatModel = new ChatOpenAI({
        openAIApiKey: langchainConfig.openaiApiKey,
        modelName: langchainConfig.model,
        temperature: langchainConfig.temperature,
        maxTokens: langchainConfig.maxTokens,
      });
    } else if (langchainConfig.provider === 'local') {
      // Configuración para modelos locales (Ollama, LM Studio, etc.)
      this.chatModel = new ChatOpenAI({
        openAIApiKey: langchainConfig.localApiKey,
        modelName: langchainConfig.model,
        temperature: langchainConfig.temperature,
        maxTokens: langchainConfig.maxTokens,
        configuration: {
          baseURL: langchainConfig.baseUrl,
        },
      });
    } else {
      // Modo DEMO - no inicializar modelo
      this.logger.log('🔧 Modo DEMO activado - usando respuestas simuladas con datos reales');
    }

    // Inicializar herramientas (Tools)
    this.tools = this.initializeTools();
    
    // Bindear tools al modelo si no estamos en modo demo
    if (langchainConfig.provider !== 'demo' && this.chatModel) {
      this.chatModelWithTools = this.chatModel.bindTools(this.tools);
      this.logger.log('✅ Modelo OpenAI configurado con Tools (Function Calling)');
    }
  }

  /**
   * Inicializa las herramientas (Tools) que la IA puede usar
   * Similar a @Tool en Java LangChain4j
   */
  private initializeTools(): DynamicStructuredTool[] {
    return [
      new DynamicStructuredTool({
        name: 'buscar_talleres',
        description: 'Busca talleres disponibles en la plataforma PitsApp. USA ESTA HERRAMIENTA cuando el usuario pregunte por talleres, servicios automotrices, reparaciones o mantenimiento. Retorna información REAL como nombre, ciudad, calificación y especialidades.',
        schema: z.object({
          ciudad: z.string().optional().describe('Ciudad para filtrar talleres. Ejemplo: Medellín, Bogotá'),
          especialidad: z.string().optional().describe('Especialidad del taller: frenos, motor, transmision, electrico, suspension'),
        }),
        func: async ({ ciudad, especialidad }) => {
          this.logger.log(`🔧 [TOOL LLAMADA] buscar_talleres(ciudad="${ciudad}", especialidad="${especialidad}")`);
          
          const workshops = await this.workshopsService.findAll();
          let filtered = workshops;
          
          if (ciudad) {
            filtered = filtered.filter(w => w.city?.toLowerCase().includes(ciudad.toLowerCase()));
          }
          
          if (especialidad) {
            filtered = filtered.filter(w => 
              w.specialties?.some(s => s.toLowerCase().includes(especialidad.toLowerCase()))
            );
          }
          
          const result = filtered.slice(0, 5).map(w => ({
            nombre: w.name,
            ciudad: w.city,
            barrio: w.neighborhood,
            calificacion: w.rating || 'Sin calificación',
            especialidades: w.specialties || [],
            telefono: w.phone,
            email: w.email,
          }));

          this.logger.log(`✅ [TOOL RESULTADO] ${result.length} talleres encontrados`);
          return JSON.stringify(result, null, 2);
        },
      }),

      new DynamicStructuredTool({
        name: 'buscar_repuestos',
        description: 'Busca repuestos disponibles en el marketplace de PitsApp. USA ESTA HERRAMIENTA cuando el usuario pregunte por repuestos, partes, piezas o componentes automotrices. Retorna información REAL con precios y stock.',
        schema: z.object({
          categoria: z.string().optional().describe('Categoría: llantas, frenos, filtros, aceites, baterías, suspensión'),
          nombre: z.string().optional().describe('Nombre o descripción del repuesto a buscar'),
          precioMaximo: z.number().optional().describe('Precio máximo en COP'),
        }),
        func: async ({ categoria, nombre, precioMaximo }) => {
          this.logger.log(`🔧 [TOOL LLAMADA] buscar_repuestos(categoria="${categoria}", nombre="${nombre}", precioMax=${precioMaximo})`);
          
          const parts = await this.partsService.findAll();
          let filtered = parts;
          
          if (categoria) {
            filtered = filtered.filter(p => 
              p.category?.toLowerCase().includes(categoria.toLowerCase())
            );
          }
          
          if (nombre) {
            filtered = filtered.filter(p => 
              p.name?.toLowerCase().includes(nombre.toLowerCase())
            );
          }

          if (precioMaximo) {
            filtered = filtered.filter(p => (p.price || 0) <= precioMaximo);
          }
          
          const result = filtered.slice(0, 5).map(p => ({
            nombre: p.name,
            precio: `$${(p.price || 0).toLocaleString()} COP`,
            stock: p.stock || 0,
            categoria: p.category,
            marca: p.brand,
            descripcion: p.description,
          }));

          this.logger.log(`✅ [TOOL RESULTADO] ${result.length} repuestos encontrados`);
          return JSON.stringify(result, null, 2);
        },
      }),

      new DynamicStructuredTool({
        name: 'buscar_solicitudes_activas',
        description: 'Busca solicitudes de servicio activas que están esperando ofertas. Útil para mostrar ejemplos de solicitudes o cuando talleres buscan trabajo.',
        schema: z.object({
          tipoServicio: z.string().optional().describe('Tipo: mantenimiento, reparacion, diagnostico, grua, cambio_aceite'),
        }),
        func: async ({ tipoServicio }) => {
          this.logger.log(`🔧 [TOOL LLAMADA] buscar_solicitudes_activas(tipo="${tipoServicio}")`);
          
          const requests = await this.serviceRequestsService.findAvailableForBids();
          let filtered = requests;
          
          if (tipoServicio) {
            filtered = filtered.filter(r => 
              r.serviceType?.toLowerCase().includes(tipoServicio.toLowerCase())
            );
          }
          
          const result = filtered.slice(0, 5).map(r => ({
            id: r.id,
            descripcion: r.description,
            tipoServicio: r.serviceType,
            urgencia: r.urgencyLevel,
            fechaCreacion: r.createdAt,
          }));

          this.logger.log(`✅ [TOOL RESULTADO] ${result.length} solicitudes encontradas`);
          return JSON.stringify(result, null, 2);
        },
      }),
    ];
  }

  /**
   * Genera un saludo personalizado para PitsApp
   * Similar a generateGreeting() en Java LangChain4j
   */
  async generateGreeting(platform: string = 'PitsApp'): Promise<string> {
    try {
      if (langchainConfig.provider === 'demo') {
        return `¡Bienvenido a ${platform}! 🚗 Somos la mejor plataforma de servicios automotrices en Medellín, conectando usuarios con talleres certificados y repuestos de calidad.`;
      }

      const messages = [
        new HumanMessage(
          `Da un mensaje de saludo al usuario de la plataforma ${platform}. Menciona que somos los mejores en conectar usuarios con talleres automotrices y repuestos en Medellín, Colombia. Máximo 30 palabras.`
        ),
      ];

      const response = await this.chatModel.invoke(messages);
      return response.content as string;
    } catch (error) {
      this.logger.error('Error generando saludo:', error);
      return `¡Bienvenido a ${platform}! Tu plataforma de confianza para servicios automotrices.`;
    }
  }

  /**
   * Genera sugerencias de talleres basadas en las necesidades del usuario
   * Similar a generateProductSuggestion() en Java LangChain4j
   */
  async generateWorkshopSuggestion(userMessage: string): Promise<string> {
    try {
      if (langchainConfig.provider === 'demo') {
        return await this.getDemoResponseWithData(userMessage);
      }

      if (!this.chatModelWithTools) {
        return 'El servicio de IA no está disponible en este momento.';
      }

      this.logger.log('🏭 Generando sugerencia de talleres con Tools');

      const systemPrompt = `Eres un experto en servicios automotrices que recomienda personalizadamente talleres según las necesidades del usuario.

IMPORTANTE: 
- Debes recomendar máximo 3 talleres
- USA LA HERRAMIENTA "buscar_talleres" para obtener información REAL de talleres
- NO inventes datos, SOLO recomienda talleres que existan en la plataforma PitsApp
- Menciona nombre, ubicación, calificación y especialidades de cada taller recomendado`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ];

      // Primera invocación
      let response = await this.chatModelWithTools.invoke(messages);
      
      // Si el modelo quiere usar una tool, ejecutarla
      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const toolCall of response.tool_calls) {
          const tool = this.tools.find(t => t.name === toolCall.name);
          
          if (tool) {
            const toolResult = await tool.func(toolCall.args);
            messages.push(response);
            messages.push({
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
            } as any);
            
            response = await this.chatModelWithTools.invoke(messages);
          }
        }
      }
      
      return response.content as string;
    } catch (error) {
      this.logger.error('Error generando sugerencia de taller:', error);
      throw new Error('No se pudo generar la sugerencia.');
    }
  }

  /**
   * Genera sugerencias de repuestos basadas en las necesidades del usuario
   * Similar a generateProductSuggestion() en Java LangChain4j
   */
  async generatePartsSuggestion(userMessage: string): Promise<string> {
    try {
      if (langchainConfig.provider === 'demo') {
        const parts = await this.partsService.findAll();
        const topParts = parts.filter(p => (p.stock || 0) > 0).slice(0, 3);
        
        if (topParts.length === 0) {
          return 'Actualmente no hay repuestos en stock. Te recomiendo crear una solicitud de servicio.';
        }

        let response = 'Basado en tu consulta, te recomiendo estos repuestos:\n\n';
        topParts.forEach((p, i) => {
          response += `${i + 1}. **${p.name}**\n`;
          response += `   💰 $${p.price.toLocaleString()} COP\n`;
          response += `   📦 ${p.stock} disponibles\n\n`;
        });

        return response;
      }

      if (!this.chatModelWithTools) {
        return 'El servicio de IA no está disponible en este momento.';
      }

      this.logger.log('🔧 Generando sugerencia de repuestos con Tools');

      const systemPrompt = `Eres un experto en repuestos automotrices que recomienda personalizadamente según las necesidades del usuario.

IMPORTANTE:
- Debes recomendar máximo 3 repuestos
- USA LA HERRAMIENTA "buscar_repuestos" para obtener información REAL de repuestos
- NO inventes datos, SOLO recomienda repuestos que existan en la plataforma PitsApp
- Menciona nombre, precio, stock disponible y marca de cada repuesto`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ];

      // Primera invocación
      let response = await this.chatModelWithTools.invoke(messages);
      
      // Si el modelo quiere usar una tool, ejecutarla
      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const toolCall of response.tool_calls) {
          const tool = this.tools.find(t => t.name === toolCall.name);
          
          if (tool) {
            const toolResult = await tool.func(toolCall.args);
            messages.push(response);
            messages.push({
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
            } as any);
            
            response = await this.chatModelWithTools.invoke(messages);
          }
        }
      }
      
      return response.content as string;
    } catch (error) {
      this.logger.error('Error generando sugerencia de repuestos:', error);
      throw new Error('No se pudo generar la sugerencia.');
    }
  }

  /**
   * Procesa un mensaje del usuario y genera una respuesta de IA
   */
  async chat(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    try {
      // Modo DEMO: Si el provider es "demo", usar respuestas mejoradas con datos reales
      if (langchainConfig.provider === 'demo') {
        return await this.getDemoResponseWithData(userMessage);
      }

      // Si no tenemos modelo con tools, usar el simple
      if (!this.chatModelWithTools) {
        return await this.chatSimple(userMessage, conversationHistory);
      }

      this.logger.log('🤖 Procesando mensaje con OpenAI + Tools');

      const systemPrompt = `Eres un asistente virtual especializado en servicios automotrices de PitsApp en Medellín, Colombia.

Tu función principal es ayudar a los clientes a:
1. Identificar qué tipo de servicio automotriz necesitan
2. Determinar la urgencia del servicio
3. Recomendar talleres según sus necesidades
4. Ayudarles a encontrar repuestos específicos
5. Guiarlos en la creación de solicitudes de servicio

HERRAMIENTAS DISPONIBLES:
Tienes acceso a 3 herramientas para buscar información REAL:
- buscar_talleres: Busca talleres reales en la plataforma
- buscar_repuestos: Busca repuestos disponibles con precios
- buscar_solicitudes_activas: Busca solicitudes de servicio activas

INSTRUCCIONES IMPORTANTES:
- SIEMPRE USA LAS HERRAMIENTAS cuando el usuario pregunte por talleres, repuestos o servicios
- NO inventes información, usa las tools para obtener datos reales
- Sé amable, profesional y conversacional
- Haz preguntas para entender mejor las necesidades
- Recomienda crear una solicitud de servicio cuando sea apropiado`;

      const messages = [
        new SystemMessage(systemPrompt),
        ...conversationHistory.map((msg) =>
          msg.role === 'user'
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content),
        ),
        new HumanMessage(userMessage),
      ];

      // Primera invocación - el modelo puede decidir llamar a una tool
      let response = await this.chatModelWithTools.invoke(messages);
      
      // Si el modelo quiere usar una tool, ejecutarla
      if (response.tool_calls && response.tool_calls.length > 0) {
        this.logger.log(`🔧 Modelo decidió usar ${response.tool_calls.length} tool(s)`);
        
        // Ejecutar cada tool call
        for (const toolCall of response.tool_calls) {
          const tool = this.tools.find(t => t.name === toolCall.name);
          
          if (tool) {
            try {
              const toolResult = await tool.func(toolCall.args);
              
              // Agregar resultado de la tool a los mensajes
              messages.push(response);
              messages.push({
                role: 'tool',
                content: toolResult,
                tool_call_id: toolCall.id,
              } as any);
              
              // Invocar nuevamente para que el modelo genere una respuesta con el resultado
              response = await this.chatModelWithTools.invoke(messages);
            } catch (error) {
              this.logger.error(`Error ejecutando tool ${toolCall.name}:`, error);
            }
          }
        }
      }
      
      return response.content as string;
    } catch (error) {
      this.logger.error('❌ Error al procesar chat con IA:', error);
      this.logger.error('Detalles del error:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        response: error?.response?.data || error?.response,
      });
      
      // Retornar un mensaje más descriptivo del error
      if (error?.message?.includes('API key')) {
        throw new Error('Error con la API key de OpenAI. Verifica que sea válida y tenga créditos.');
      } else if (error?.message?.includes('rate limit')) {
        throw new Error('Has excedido el límite de solicitudes. Espera unos segundos.');
      } else if (error?.message?.includes('insufficient_quota')) {
        throw new Error('Tu cuenta de OpenAI no tiene créditos suficientes.');
      }
      
      throw new Error(`Error procesando mensaje: ${error?.message || 'Error desconocido'}`);
    }
  }

  /**
   * Chat simple sin tools (fallback)
   */
  private async chatSimple(userMessage: string, conversationHistory: any[]): Promise<string> {
    const platformContext = await this.getPlatformContext(userMessage);

    const systemPrompt = `Eres un asistente virtual especializado en servicios automotrices de PitsApp en Medellín, Colombia.

Tu función principal es ayudar a los clientes a:
1. Identificar qué tipo de servicio automotriz necesitan (mantenimiento, reparación, diagnóstico, etc.)
2. Determinar la urgencia del servicio
3. Recomendar talleres según sus necesidades
4. Ayudarles a encontrar repuestos específicos
5. Guiarlos en la creación de solicitudes de servicio

Características importantes:
- Sé amable, profesional y conciso
- Haz preguntas específicas para entender mejor la necesidad
- Si el usuario menciona síntomas del vehículo, ayúdale a identificar el posible problema
- Recomienda crear una solicitud de servicio cuando tengas suficiente información
- Usa lenguaje técnico cuando sea apropiado, pero explícalo de manera simple

Información sobre PitsApp:
- Plataforma que conecta usuarios con talleres y proveedores de repuestos
- Permite crear solicitudes de servicio y recibir cotizaciones
- Los talleres pueden ofertar en las solicitudes
- También hay un marketplace de repuestos

CONTEXTO ACTUAL DE LA PLATAFORMA:
${platformContext}

Responde de manera natural y conversacional, usando la información actual de la plataforma cuando sea relevante.`;

    const messages = [
      new SystemMessage(systemPrompt),
      ...conversationHistory.map((msg) =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      ),
      new HumanMessage(userMessage),
    ];

    const response = await this.chatModel.invoke(messages);
    
    return response.content as string;
  }

  /**
   * Obtiene contexto relevante de la plataforma basado en el mensaje del usuario
   */
  private async getPlatformContext(userMessage: string): Promise<string> {
    const message = userMessage.toLowerCase();
    let context = '';

    try {
      // Si pregunta por talleres
      if (message.includes('taller') || message.includes('servicio') || message.includes('reparar')) {
        const workshops = await this.workshopsService.findAll();
        const workshopCount = workshops.length;
        const cities = [...new Set(workshops.map(w => w.city))];
        
        context += `\n- Talleres disponibles: ${workshopCount} talleres en ${cities.join(', ')}`;
        
        if (workshopCount > 0) {
          const topRated = workshops
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
            .map(w => `${w.name} (${w.city}, ${w.rating || 0}⭐)`)
            .join(', ');
          context += `\n- Talleres destacados: ${topRated}`;
        }
      }

      // Si pregunta por repuestos
      if (message.includes('repuesto') || message.includes('pieza') || message.includes('parte')) {
        const parts = await this.partsService.findAll();
        const partCount = parts.length;
        const categories = [...new Set(parts.map(p => p.category).filter(Boolean))];
        
        context += `\n- Repuestos disponibles: ${partCount} repuestos`;
        if (categories.length > 0) {
          context += `\n- Categorías: ${categories.slice(0, 5).join(', ')}`;
        }
      }

      // Si pregunta por solicitudes o servicios activos
      if (message.includes('solicitud') || message.includes('cotizaci')) {
        const requests = await this.serviceRequestsService.findAvailableForBids();
        context += `\n- Solicitudes activas: ${requests.length} solicitudes esperando ofertas`;
      }

      return context || 'No hay contexto adicional disponible en este momento.';
    } catch (error) {
      this.logger.error('Error al obtener contexto de plataforma:', error);
      return 'Contexto no disponible temporalmente.';
    }
  }

  /**
   * Genera respuestas mejoradas para el modo DEMO usando datos reales
   */
  private async getDemoResponseWithData(userMessage: string): Promise<string> {
    const message = userMessage.toLowerCase();
    
    try {
      // Consultar talleres si pregunta por talleres
      if (message.includes('taller') || message.includes('recomienda') || message.includes('donde')) {
        const workshops = await this.workshopsService.findAll();
        
        if (workshops.length === 0) {
          return 'Actualmente no hay talleres registrados en la plataforma. ¡Pero puedes ser el primero en registrar tu taller o crear una solicitud de servicio!';
        }

        const topWorkshops = workshops
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);

        let response = `¡Tenemos ${workshops.length} talleres registrados en PitsApp! 🚗\n\nAquí están los más destacados:\n\n`;
        
        topWorkshops.forEach((w, i) => {
          response += `${i + 1}. **${w.name}**\n`;
          response += `   📍 ${w.city}, ${w.neighborhood || 'ubicación central'}\n`;
          response += `   ⭐ Rating: ${w.rating || 'Nuevo'}\n`;
          if (w.specialties && w.specialties.length > 0) {
            response += `   🔧 Especialidades: ${w.specialties.slice(0, 3).join(', ')}\n`;
          }
          response += `\n`;
        });

        response += '\n¿Quieres que te ayude a crear una solicitud de servicio para recibir cotizaciones?';
        return response;
      }

      // Consultar repuestos
      if (message.includes('repuesto') || message.includes('pieza') || message.includes('parte') || message.includes('llanta')) {
        const parts = await this.partsService.findAll();
        
        if (parts.length === 0) {
          return 'Actualmente no hay repuestos disponibles en el marketplace. Puedes ser el primero en publicar repuestos o crear una solicitud de servicio.';
        }

        const availableParts = parts.filter(p => (p.stock || 0) > 0).slice(0, 5);
        
        let response = `¡Tenemos ${parts.length} repuestos en nuestro marketplace! 🔧\n\n`;
        
        if (availableParts.length > 0) {
          response += 'Algunos repuestos disponibles:\n\n';
          availableParts.forEach((p, i) => {
            response += `${i + 1}. **${p.name}**\n`;
            response += `   💰 Precio: $${p.price.toLocaleString()} COP\n`;
            response += `   📦 Stock: ${p.stock} unidades\n`;
            if (p.brand) response += `   🏷️ Marca: ${p.brand}\n`;
            response += `\n`;
          });
        }

        const categories = [...new Set(parts.map(p => p.category).filter(Boolean))];
        if (categories.length > 0) {
          response += `\nCategorías disponibles: ${categories.join(', ')}\n`;
        }

        return response;
      }
    } catch (error) {
      this.logger.error('Error al obtener datos para demo:', error);
    }

    // Fallback a respuesta estándar de demo
    return this.getDemoResponse(userMessage);
  }

  /**
   * Genera respuestas simuladas para el modo DEMO
   */
  private getDemoResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Respuestas contextuales basadas en palabras clave
    if (message.includes('hola') || message.includes('buenos') || message.includes('buenas')) {
      return '¡Hola! 👋 Soy tu asistente virtual de PitsApp. Estoy aquí para ayudarte con servicios automotrices en Medellín. ¿En qué puedo ayudarte hoy? Puedo ayudarte a encontrar talleres, identificar problemas de tu vehículo o buscar repuestos.';
    }
    
    if (message.includes('no arranca') || message.includes('no enciende') || message.includes('no prende')) {
      return 'Entiendo que tu vehículo no arranca. Esto puede deberse a varias causas:\n\n1. **Batería descargada** - La más común\n2. **Problemas en el motor de arranque**\n3. **Sistema de combustible**\n4. **Falla en el sistema eléctrico**\n\n¿Escuchas algún ruido cuando intentas encenderlo? ¿Las luces del tablero encienden normalmente?';
    }
    
    if (message.includes('aceite') || message.includes('cambio') || message.includes('mantenimiento')) {
      return 'El cambio de aceite es fundamental para la vida útil de tu motor. En Medellín, el costo promedio está entre $80,000 y $150,000 COP dependiendo del tipo de aceite.\n\n**Recomendaciones:**\n- Aceite sintético cada 10,000 km\n- Aceite mineral cada 5,000 km\n\n¿Quieres que te ayude a crear una solicitud para recibir cotizaciones de talleres cercanos?';
    }
    
    if (message.includes('freno') || message.includes('frena')) {
      return 'Los problemas de frenos son muy importantes por seguridad. Según tus síntomas, podría necesitar:\n\n1. **Cambio de pastillas** - $150,000 - $300,000 COP\n2. **Cambio de discos** - $300,000 - $600,000 COP\n3. **Revisión del sistema hidráulico**\n\n**Urgencia: ALTA** ⚠️\n\nTe recomiendo crear una solicitud de servicio urgente. ¿Deseas que te guíe en el proceso?';
    }
    
    if (message.includes('ruido') || message.includes('sonido') || message.includes('hace')) {
      return 'Los ruidos en el vehículo pueden indicar varios problemas. Para ayudarte mejor, necesito más información:\n\n¿Cuándo ocurre el ruido?\n- ¿Al frenar?\n- ¿Al acelerar?\n- ¿Al girar?\n- ¿Todo el tiempo?\n\n¿Cómo describirías el sonido?\n- Chirrido\n- Golpeteo\n- Zumbido\n- Clic';
    }
    
    if (message.includes('llanta') || message.includes('neumático') || message.includes('caucho')) {
      return 'Para las llantas, te puedo ayudar de dos formas:\n\n**1. Servicio de cambio/montaje:**\nTalleres especializados en Medellín\nCosto: $30,000 - $80,000 COP por llanta\n\n**2. Comprar llantas:**\nPuedes buscar en nuestro marketplace de repuestos\nMarcas disponibles: Michelin, Goodyear, Pirelli, etc.\n\n¿Qué necesitas: servicio o comprar llantas nuevas?';
    }
    
    if (message.includes('taller') || message.includes('recomienda') || message.includes('donde')) {
      return 'Puedo recomendarte talleres en Medellín según tus necesidades. Para darte las mejores opciones, cuéntame:\n\n1. ¿Qué zona de Medellín prefieres? (Poblado, Laureles, Centro, etc.)\n2. ¿Qué tipo de servicio necesitas?\n3. ¿Es urgente o puedes esperar unos días?\n\nTambién puedes crear una solicitud y recibir ofertas de varios talleres certificados.';
    }
    
    if (message.includes('precio') || message.includes('costo') || message.includes('cuanto')) {
      return 'Los costos varían según el servicio y el taller. Aquí te doy estimados generales en Medellín:\n\n**Mantenimiento básico:** $80,000 - $200,000\n**Diagnóstico computarizado:** $50,000 - $100,000\n**Cambio de frenos:** $150,000 - $600,000\n**Reparación motor:** $500,000 - $3,000,000+\n\n💡 **Tip:** Crea una solicitud en PitsApp y recibe múltiples cotizaciones para comparar. ¿Te ayudo a crear una?';
    }
    
    if (message.includes('gracias') || message.includes('ok') || message.includes('vale')) {
      return '¡De nada! 😊 Estoy aquí para ayudarte cuando lo necesites. Si tienes más preguntas sobre tu vehículo o necesitas encontrar talleres en Medellín, no dudes en preguntarme. ¡Que tengas un excelente día!';
    }
    
    // Respuesta genérica
    return `Entiendo que necesitas ayuda con: "${userMessage}"\n\nComo asistente de PitsApp, puedo ayudarte con:\n\n🔧 **Servicios:** Mantenimiento, reparaciones, diagnóstico\n🏪 **Talleres:** Recomendaciones en Medellín\n🔩 **Repuestos:** Búsqueda de partes\n📝 **Solicitudes:** Crear y recibir cotizaciones\n\n¿Podrías darme más detalles sobre lo que necesitas? Por ejemplo:\n- ¿Qué problema tiene tu vehículo?\n- ¿Qué tipo de servicio buscas?\n- ¿Necesitas repuestos específicos?\n\n**Nota:** Estoy en modo DEMO. Para respuestas más precisas, configura una API key de OpenAI real.`;
  }

  /**
   * Analiza las necesidades del usuario y sugiere un tipo de servicio
   */
  async analyzeServiceNeeds(description: string): Promise<{
    serviceType: string;
    urgency: string;
    suggestedActions: string[];
    estimatedCost: string;
  }> {
    try {
      // Modo DEMO: análisis simple basado en palabras clave
      if (langchainConfig.provider === 'demo') {
        return this.analyzeDemoNeeds(description);
      }

      const prompt = `Analiza la siguiente descripción de un problema automotriz y proporciona:
1. Tipo de servicio requerido (mantenimiento, reparación, diagnóstico, etc.)
2. Nivel de urgencia (baja, media, alta, crítica)
3. 3 acciones sugeridas
4. Rango de costo estimado en COP (formato: "X - Y COP")

Descripción: "${description}"

Responde SOLO en formato JSON estricto, sin texto adicional:
{
  "serviceType": "tipo",
  "urgency": "nivel",
  "suggestedActions": ["acción1", "acción2", "acción3"],
  "estimatedCost": "rango"
}`;

      const response = await this.chatModel.invoke([new HumanMessage(prompt)]);
      const content = response.content as string;
      
      // Extraer JSON de la respuesta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error al analizar necesidades:', error);
      // Respuesta por defecto
      return {
        serviceType: 'general',
        urgency: 'media',
        suggestedActions: [
          'Crear una solicitud de servicio',
          'Consultar con un taller especializado',
          'Obtener varias cotizaciones',
        ],
        estimatedCost: 'Por determinar',
      };
    }
  }

  /**
   * Análisis simplificado para modo DEMO
   */
  private analyzeDemoNeeds(description: string): {
    serviceType: string;
    urgency: string;
    suggestedActions: string[];
    estimatedCost: string;
  } {
    const desc = description.toLowerCase();
    
    // Casos críticos
    if (desc.includes('freno') || desc.includes('no frena')) {
      return {
        serviceType: 'Reparación de frenos',
        urgency: 'crítica',
        suggestedActions: [
          'Revisar sistema de frenos inmediatamente',
          'No usar el vehículo hasta la revisión',
          'Contactar taller especializado urgente'
        ],
        estimatedCost: '150,000 - 600,000 COP'
      };
    }
    
    if (desc.includes('humo') || desc.includes('sobrecalien') || desc.includes('temperatura')) {
      return {
        serviceType: 'Diagnóstico y reparación motor',
        urgency: 'alta',
        suggestedActions: [
          'Apagar el motor inmediatamente',
          'Revisar nivel de refrigerante',
          'Diagnóstico profesional urgente'
        ],
        estimatedCost: '100,000 - 1,500,000 COP'
      };
    }
    
    // Problemas de arranque
    if (desc.includes('no arranca') || desc.includes('no enciende')) {
      return {
        serviceType: 'Diagnóstico eléctrico',
        urgency: 'alta',
        suggestedActions: [
          'Revisar batería',
          'Verificar motor de arranque',
          'Diagnóstico del sistema eléctrico'
        ],
        estimatedCost: '80,000 - 500,000 COP'
      };
    }
    
    // Mantenimiento rutinario
    if (desc.includes('aceite') || desc.includes('mantenimiento') || desc.includes('kilometraje')) {
      return {
        serviceType: 'Mantenimiento preventivo',
        urgency: 'media',
        suggestedActions: [
          'Cambio de aceite y filtros',
          'Revisión general del vehículo',
          'Programar cita en taller de confianza'
        ],
        estimatedCost: '80,000 - 250,000 COP'
      };
    }
    
    // Ruidos
    if (desc.includes('ruido') || desc.includes('sonido')) {
      return {
        serviceType: 'Diagnóstico general',
        urgency: 'media',
        suggestedActions: [
          'Identificar origen del ruido',
          'Revisión de suspensión y dirección',
          'Diagnóstico profesional'
        ],
        estimatedCost: '50,000 - 400,000 COP'
      };
    }
    
    // Llantas
    if (desc.includes('llanta') || desc.includes('neumático') || desc.includes('caucho')) {
      return {
        serviceType: 'Servicio de llantas',
        urgency: 'baja',
        suggestedActions: [
          'Revisar estado de llantas',
          'Verificar presión de aire',
          'Alineación y balanceo si es necesario'
        ],
        estimatedCost: '30,000 - 80,000 COP por llanta'
      };
    }
    
    // Default
    return {
      serviceType: 'Diagnóstico general',
      urgency: 'media',
      suggestedActions: [
        'Crear solicitud de servicio en PitsApp',
        'Describir síntomas detalladamente',
        'Recibir cotizaciones de talleres'
      ],
      estimatedCost: '50,000 - 300,000 COP'
    };
  }

  /**
   * Genera recomendaciones de talleres basadas en las necesidades
   */
  async recommendWorkshops(
    serviceType: string,
    location: string,
  ): Promise<string> {
    try {
      const prompt = `Como experto en servicios automotrices en Medellín, recomienda características importantes que debe tener un taller para el siguiente servicio:

Tipo de servicio: ${serviceType}
Ubicación: ${location}

Proporciona 3-4 puntos clave que el usuario debe buscar en un taller.`;

      const response = await this.chatModel.invoke([new HumanMessage(prompt)]);
      return response.content as string;
    } catch (error) {
      this.logger.error('Error al generar recomendaciones:', error);
      return 'Busca talleres con buenas calificaciones, experiencia en el tipo de servicio que necesitas y ubicación conveniente.';
    }
  }
}
