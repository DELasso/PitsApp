# Chat de IA con LangChain - PitsApp

## 🤖 Descripción

Se ha implementado un asistente virtual con inteligencia artificial usando LangChain y OpenAI que **consulta datos reales de la plataforma** y ayuda a los clientes a:

- Identificar qué tipo de servicio automotriz necesitan
- Determinar la urgencia del servicio  
- **Recomendar talleres REALES registrados en la plataforma**
- **Buscar repuestos REALES disponibles en el marketplace**
- Guiarlos en la creación de solicitudes de servicio
- **Ver solicitudes activas en la plataforma**

## 🔗 Integración con la Base de Datos

A diferencia de un chatbot genérico, este asistente está **integrado con los servicios de la aplicación**:

```typescript
constructor(
  private readonly workshopsService: WorkshopsService,      // ← Consulta talleres
  private readonly partsService: PartsService,              // ← Consulta repuestos
  private readonly serviceRequestsService: ServiceRequestsService, // ← Consulta solicitudes
) {}
```

### ¿Cómo funciona?

1. **Usuario pregunta:** "¿Qué talleres tienes disponibles?"
2. **El chat consulta:** `workshopsService.findAll()` 
3. **Obtiene datos reales:** Lista de talleres registrados en Supabase
4. **Responde con información actual:** Nombres, ubicaciones, ratings, especialidades

Lo mismo aplica para:
- Repuestos en el marketplace
- Solicitudes de servicio activas
- Información de precios y disponibilidad

## 📁 Archivos Creados

### Backend (NestJS)

```
backend/src/
├── config/
│   └── langchain.config.ts          # Configuración de LangChain y OpenAI
├── modules/
│   └── ai-chat/
│       ├── ai-chat.module.ts        # Módulo del chat
│       ├── ai-chat.controller.ts    # Controlador con endpoints
│       ├── ai-chat.service.ts       # Lógica del chat con IA
│       └── dto/
│           └── chat.dto.ts          # DTOs para validación
```

### Frontend (Angular)

```
frontend/src/app/
├── components/
│   └── ai-chat/
│       ├── ai-chat.component.ts     # Componente del chat
│       ├── ai-chat.component.html   # Template del chat
│       └── ai-chat.component.scss   # Estilos del chat
├── models/
│   └── chat.model.ts                # Interfaces del chat
└── services/
    └── ai-chat.service.ts           # Servicio para API
```

## 🔑 Configuración de OpenAI

### Opción 1: Usar GPT-3.5-turbo (Gratis para desarrollo con créditos)

1. **Obtener API Key:**
   - Ve a https://platform.openai.com/api-keys
   - Crea una cuenta o inicia sesión
   - Haz clic en "Create new secret key"
   - Copia la API key

2. **Configurar en el .env:**
   ```bash
   OPENAI_API_KEY=tu_api_key_aquí
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_TEMPERATURE=0.7
   OPENAI_MAX_TOKENS=1000
   ```

### Opción 2: Usar modelos locales gratuitos (Alternativa)

Si prefieres no usar OpenAI, puedes usar Ollama (totalmente gratis):

1. Instala Ollama: https://ollama.ai/
2. Ejecuta un modelo local:
   ```bash
   ollama pull llama2
   ```
3. Modifica `ai-chat.service.ts` para usar Ollama en lugar de OpenAI

## 🚀 Endpoints del API

### POST `/api/ai-chat/message`
Envía un mensaje al chat y recibe una respuesta de la IA.

**Body:**
```json
{
  "message": "Mi carro hace un ruido extraño al frenar",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hola"
    },
    {
      "role": "assistant",
      "content": "Hola, ¿en qué puedo ayudarte?"
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "response": "Ese ruido al frenar podría indicar varias cosas..."
}
```

### POST `/api/ai-chat/analyze-needs`
Analiza la descripción del problema y sugiere tipo de servicio.

**Body:**
```json
{
  "description": "Mi carro no arranca y hace un ruido de clic"
}
```

**Respuesta:**
```json
{
  "success": true,
  "analysis": {
    "serviceType": "diagnóstico eléctrico",
    "urgency": "alta",
    "suggestedActions": [
      "Revisar batería",
      "Verificar motor de arranque",
      "Consultar con electricista automotriz"
    ],
    "estimatedCost": "150000 - 500000 COP"
  }
}
```

### POST `/api/ai-chat/recommend-workshops`
Obtiene recomendaciones de talleres.

**Body:**
```json
{
  "serviceType": "cambio de aceite",
  "location": "Medellín"
}
```

## 💻 Uso del Componente

El chat aparece como un botón flotante en la esquina inferior derecha de todas las páginas.

### Características:

- **Botón flotante:** Siempre visible con emoji 💬
- **Ventana de chat:** Se abre/cierra con el botón
- **Historial:** Mantiene el contexto de la conversación
- **Responsive:** Funciona en desktop y móvil
- **Indicador de escritura:** Muestra cuando la IA está "pensando"
- **Mensajes con timestamp:** Cada mensaje tiene su hora

## 🎨 Personalización

### Cambiar colores del chat

Edita `ai-chat.component.scss`:

```scss
.chat-toggle-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // Cambia estos colores
}
```

### Modificar el prompt del sistema

Edita `ai-chat.service.ts` en el método `chat()`:

```typescript
const systemPrompt = `Eres un asistente virtual...`;
```

## 🧪 Probar el Chat

1. **Inicia los servidores:**
   ```bash
   npm run dev
   ```

2. **Abre el navegador:**
   - Frontend: http://localhost:4200
   - Verás el botón de chat 💬 en la esquina inferior derecha

3. **Prueba mensajes como:**
   - "Mi carro no arranca"
   - "Necesito cambiar las llantas"
   - "¿Qué talleres me recomiendas para frenos?"
   - "Mi aceite está muy oscuro"

## 📊 Costos de OpenAI

**GPT-3.5-turbo:**
- Entrada: $0.0005 por 1K tokens
- Salida: $0.0015 por 1K tokens

**Ejemplo:** 100 conversaciones de ~10 mensajes = ~$0.50 USD

**Créditos gratis:** OpenAI da $5 de crédito gratis para nuevas cuentas.

## ⚠️ Notas Importantes

1. **Seguridad:** Nunca subas tu `.env` con la API key a GitHub (ya está en `.gitignore`)
2. **Rate Limits:** OpenAI tiene límites de requests por minuto
3. **Monitoreo:** Revisa tu uso en https://platform.openai.com/usage
4. **Producción:** Para producción, considera agregar:
   - Caché de respuestas comunes
   - Rate limiting
   - Almacenamiento de conversaciones en BD
   - Monitoreo de costos

## 🔧 Troubleshooting

### Error: "OPENAI_API_KEY no está configurada"
- Verifica que agregaste la API key en el archivo `.env`
- Reinicia el servidor backend

### Error: "No se pudo procesar el mensaje"
- Verifica tu conexión a internet
- Revisa que tu API key sea válida
- Verifica que tengas créditos en tu cuenta de OpenAI

### El chat no aparece
- Verifica que importaste `AiChatComponent` en `app.component.ts`
- Verifica que el frontend esté compilando sin errores

## 📚 Recursos

- [LangChain Docs](https://js.langchain.com/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [NestJS Docs](https://docs.nestjs.com/)
- [Angular Docs](https://angular.io/docs)

## 🎯 Próximas Mejoras

- [ ] Agregar soporte para imágenes (GPT-4 Vision)
- [ ] Guardar conversaciones en la base de datos
- [ ] Agregar sugerencias rápidas (quick replies)
- [ ] Integrar con el sistema de solicitudes de servicio
- [ ] Agregar análisis de sentimiento
- [ ] Soporte multiidioma

---

**Desarrollado para PitsApp** 🚗
