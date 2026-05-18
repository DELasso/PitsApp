import { Injectable } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { langchainConfig } from "../../config/langchain.config";

@Injectable()
export class AiChatService {
  private llm: ChatOpenAI;

  constructor() {
    const isDemo = langchainConfig.provider === "demo";
    const isLocal = langchainConfig.provider === "local";

    this.llm = new ChatOpenAI({
      model: langchainConfig.model,
      temperature: langchainConfig.temperature,
      maxTokens: langchainConfig.maxTokens,
      apiKey:
        isDemo || isLocal
          ? langchainConfig.localApiKey
          : langchainConfig.openaiApiKey,
      ...(isDemo || isLocal
        ? { configuration: { baseURL: langchainConfig.baseUrl } }
        : {}),
    });
  }

  // ─── Sistema base ────────────────────────────────────────────────────────────

  private get systemPrompt(): string {
    return `Eres el asistente virtual de PitsApp, una plataforma colombiana de servicios automotrices en Medellín.
Tu rol es ayudar a los usuarios a encontrar talleres, repuestos y servicios para sus vehículos.
Responde siempre en español, de forma amigable, concisa y útil.
Si no conoces la respuesta, indícalo con honestidad y sugiere que contacten a un taller.`;
  }

  // ─── Métodos públicos ────────────────────────────────────────────────────────

  /**
   * Chat general con historial de conversación
   */
  async chat(
    message: string,
    conversationHistory?: { role: string; content: string }[],
  ): Promise<string> {
    try {
      if (langchainConfig.provider === "demo") {
        return this.getDemoResponse(message);
      }

      const messages: BaseMessage[] = [new SystemMessage(this.systemPrompt)];

      if (conversationHistory?.length) {
        for (const msg of conversationHistory) {
          if (msg.role === "user") {
            messages.push(new HumanMessage(msg.content));
          } else if (msg.role === "assistant") {
            messages.push(new AIMessage(msg.content));
          }
        }
      }

      messages.push(new HumanMessage(message));

      const response = await this.llm.invoke(messages);
      return String(response.content);
    } catch (error) {
      console.error("Error en AiChatService.chat:", error);
      return this.getDemoResponse(message);
    }
  }

  /**
   * Genera un saludo personalizado para la plataforma
   */
  async generateGreeting(platform?: string): Promise<string> {
    const name = platform ?? "PitsApp";
    if (langchainConfig.provider === "demo") {
      return `¡Hola! Soy el asistente de ${name}. ¿En qué puedo ayudarte hoy con tu vehículo?`;
    }
    try {
      const response = await this.llm.invoke([
        new SystemMessage(this.systemPrompt),
        new HumanMessage(
          `Genera un saludo breve y amigable para un usuario que acaba de abrir ${name}.`,
        ),
      ]);
      return String(response.content);
    } catch {
      return `¡Hola! Soy el asistente de ${name}. ¿En qué puedo ayudarte hoy?`;
    }
  }

  /**
   * Genera sugerencias de talleres según el mensaje del usuario
   */
  async generateWorkshopSuggestion(message: string): Promise<string> {
    if (langchainConfig.provider === "demo") {
      return "Para encontrar el mejor taller para tu necesidad, te recomiendo revisar nuestra sección de Talleres donde puedes filtrar por tipo de servicio, calificación y ubicación en Medellín.";
    }
    try {
      const response = await this.llm.invoke([
        new SystemMessage(this.systemPrompt),
        new HumanMessage(
          `El usuario busca un taller con la siguiente necesidad: "${message}".
           Sugiere cómo puede usar PitsApp para encontrar el taller ideal.
           Menciona que puede filtrar por tipo de servicio y calificación.`,
        ),
      ]);
      return String(response.content);
    } catch {
      return "Te recomiendo explorar nuestra sección de Talleres para encontrar el servicio que necesitas.";
    }
  }

  /**
   * Genera sugerencias de repuestos según el mensaje del usuario
   */
  async generatePartsSuggestion(message: string): Promise<string> {
    if (langchainConfig.provider === "demo") {
      return "En nuestra sección de Repuestos encontrarás una amplia variedad de piezas para tu vehículo. Puedes buscar por nombre, categoría o marca para encontrar exactamente lo que necesitas.";
    }
    try {
      const response = await this.llm.invoke([
        new SystemMessage(this.systemPrompt),
        new HumanMessage(
          `El usuario busca repuestos con la siguiente necesidad: "${message}".
           Sugiere cómo puede usar la sección de Repuestos de PitsApp para encontrar lo que necesita.`,
        ),
      ]);
      return String(response.content);
    } catch {
      return "Visita nuestra sección de Repuestos para encontrar las piezas que necesitas para tu vehículo.";
    }
  }

  /**
   * Analiza las necesidades de servicio del usuario
   */
  async analyzeServiceNeeds(description: string): Promise<string> {
    if (langchainConfig.provider === "demo") {
      return `Basado en tu descripción, parece que necesitas un servicio de mantenimiento o reparación. Te recomendamos crear una solicitud de servicio en PitsApp para recibir ofertas de talleres certificados.`;
    }
    try {
      const response = await this.llm.invoke([
        new SystemMessage(this.systemPrompt),
        new HumanMessage(
          `Analiza la siguiente necesidad de servicio automotriz y sugiere qué tipo de servicio necesita el usuario: "${description}".
           Sé específico y menciona los servicios disponibles en PitsApp: servicio a domicilio, grúa, cambio de aceite, diagnóstico mecánico, reparación específica.`,
        ),
      ]);
      return String(response.content);
    } catch {
      return "Basado en tu descripción, te recomendamos solicitar un diagnóstico mecánico para determinar el servicio adecuado.";
    }
  }

  /**
   * Recomienda talleres según tipo de servicio y ubicación
   */
  async recommendWorkshops(
    serviceType: string,
    location: string,
  ): Promise<string> {
    if (langchainConfig.provider === "demo") {
      return `Para el servicio de "${serviceType}" en "${location}", te recomendamos revisar los talleres disponibles en PitsApp filtrando por esa categoría. Podrás ver calificaciones y reseñas de otros usuarios.`;
    }
    try {
      const response = await this.llm.invoke([
        new SystemMessage(this.systemPrompt),
        new HumanMessage(
          `Un usuario en ${location} necesita el servicio de "${serviceType}".
           Explica cómo puede encontrar el mejor taller en PitsApp para este servicio y qué criterios considerar.`,
        ),
      ]);
      return String(response.content);
    } catch {
      return `Para ${serviceType} en ${location}, explora nuestra sección de Talleres y filtra por la categoría correspondiente.`;
    }
  }

  // ─── Respuestas demo (sin LLM) ───────────────────────────────────────────────

  private getDemoResponse(message: string): string {
    const msg = message.toLowerCase();

    if (
      msg.includes("taller") ||
      msg.includes("mecánico") ||
      msg.includes("mecanico")
    ) {
      return "¡Claro! En PitsApp puedes encontrar talleres certificados en Medellín. Ve a la sección **Talleres** para ver calificaciones, servicios y ubicaciones. ¿Qué tipo de servicio necesitas?";
    }
    if (
      msg.includes("repuesto") ||
      msg.includes("pieza") ||
      msg.includes("parte")
    ) {
      return "En nuestra sección de **Repuestos** encontrarás una amplia variedad de piezas. Puedes buscar por nombre, categoría o compatibilidad con tu vehículo. ¿Qué repuesto necesitas?";
    }
    if (msg.includes("servicio") || msg.includes("solicitud")) {
      return "Puedes solicitar servicios como: 🔧 Servicio a domicilio, 🚛 Grúa, 🛢️ Cambio de aceite, 🔍 Diagnóstico mecánico y más. Ve a **Servicios** para crear tu solicitud y recibir ofertas.";
    }
    if (
      msg.includes("precio") ||
      msg.includes("costo") ||
      msg.includes("cuánto") ||
      msg.includes("cuanto")
    ) {
      return "Los precios varían según el taller y el servicio. En PitsApp puedes solicitar múltiples cotizaciones y comparar ofertas antes de decidir. ¡Es gratis publicar tu solicitud!";
    }
    if (
      msg.includes("hola") ||
      msg.includes("buenas") ||
      msg.includes("buen")
    ) {
      return "¡Hola! 👋 Soy el asistente de PitsApp. Estoy aquí para ayudarte con talleres, repuestos y servicios automotrices en Medellín. ¿En qué te puedo ayudar?";
    }
    if (
      msg.includes("gracias") ||
      msg.includes("perfecto") ||
      msg.includes("excelente")
    ) {
      return "¡Con gusto! 😊 Si necesitas algo más sobre talleres, repuestos o servicios para tu vehículo, aquí estaré. ¡A los Pits!";
    }

    return "Entiendo tu consulta. En PitsApp puedes encontrar talleres, repuestos y solicitar servicios automotrices en Medellín. ¿Te gustaría que te ayude con algo específico sobre talleres, repuestos o servicios?";
  }
}
