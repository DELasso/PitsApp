# 🤖 Configuración de OpenAI para el Chat IA

## 📝 Requisitos

1. Una cuenta de OpenAI (https://platform.openai.com/)
2. Créditos en tu cuenta de OpenAI (mínimo $5 USD recomendado)
3. Una API Key generada desde tu dashboard de OpenAI

## 🔑 Obtener tu API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión con tu cuenta
3. Click en "Create new secret key"
4. Dale un nombre (ej: "PitsApp-Backend")
5. Copia la key (empieza con `sk-...`)
6. ⚠️ **IMPORTANTE**: Guarda la key en un lugar seguro, no la podrás ver de nuevo

## ⚙️ Configurar en tu proyecto

### 1. Editar el archivo `.env` en el backend

```bash
cd backend
nano .env  # o usa tu editor favorito
```

### 2. Agregar/actualizar estas variables:

```env
# OpenAI Configuration
LC_PROVIDER=openai
OPENAI_API_KEY=sk-tu-api-key-aqui
LC_MODEL=gpt-4o-mini
LC_TEMPERATURE=0.7
LC_MAX_TOKENS=1500
```

**Variables importantes:**
- `LC_PROVIDER=openai` - **MUY IMPORTANTE**: Activa el modo OpenAI (por defecto es "demo")
- `OPENAI_API_KEY` - Tu API key de OpenAI (empieza con `sk-`)
- `LC_MODEL` - El modelo a usar
- `LC_TEMPERATURE` - Creatividad (0.0-1.0, recomendado 0.7)
- `LC_MAX_TOKENS` - Máximo de tokens por respuesta

**Modelos disponibles:**
- `gpt-4o-mini` - Más económico, bueno para la mayoría de casos (~$0.15 por 1M tokens) ✅ **RECOMENDADO**
- `gpt-4o` - Más potente y preciso (~$2.50 por 1M tokens)
- `gpt-3.5-turbo` - Más barato pero menos capaz (~$0.50 por 1M tokens)

### 3. Reiniciar el servidor

```bash
npm run start:dev
```

## 🧪 Probar que funciona

### Verificar en los logs del servidor

Deberías ver:
```
✅ Modelo OpenAI configurado con Tools (Function Calling)
```

### Hacer una petición de prueba

```bash
# Test del chat
curl -X POST http://localhost:3000/api/ai-chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busco talleres en Medellín",
    "conversationHistory": []
  }'
```

**Respuesta esperada:**
La IA debería usar la tool `buscar_talleres` automáticamente y responder con talleres reales de tu base de datos.

En los logs verás:
```
🤖 Procesando mensaje con OpenAI + Tools
🔧 [TOOL LLAMADA] buscar_talleres(ciudad="Medellín", especialidad="undefined")
✅ [TOOL RESULTADO] 3 talleres encontrados
```

## 💰 Costos aproximados

Con `gpt-4o-mini`:
- **Chat simple**: ~$0.0002 USD por mensaje
- **Chat con tools**: ~$0.0005 USD por mensaje (usa más tokens)
- **100 mensajes con tools**: ~$0.05 USD
- **1000 mensajes con tools**: ~$0.50 USD

## 🔍 Monitorear uso

1. Ve a https://platform.openai.com/usage
2. Verás el consumo en tiempo real
3. Puedes configurar límites de gasto

## ⚠️ Problemas comunes

### Error: "Invalid API key"
- Verifica que copiaste la key completa (empieza con `sk-`)
- Asegúrate que la key está activa en tu cuenta

### Error: "Insufficient credits"
- Necesitas agregar créditos a tu cuenta de OpenAI
- Mínimo recomendado: $5 USD

### Error: "Rate limit exceeded"
- Estás haciendo demasiadas peticiones muy rápido
- Espera unos segundos entre peticiones
- Considera actualizar tu tier en OpenAI

### El chat no usa las tools
- Verifica que `LC_PROVIDER=openai` (no `demo`) en tu archivo `.env`
- Asegúrate que la variable se llama `LC_PROVIDER` y NO `LANGCHAIN_PROVIDER`
- Reinicia el servidor después de cambiar el `.env`
- Revisa los logs para ver si aparece: `✅ Modelo OpenAI configurado con Tools (Function Calling)`

## 🎯 Funcionalidades con OpenAI

✅ **Chat inteligente** que entiende contexto
✅ **Function calling** automático para buscar talleres y repuestos reales
✅ **Recomendaciones personalizadas** basadas en datos reales
✅ **Historial de conversación** con memoria
✅ **Análisis de necesidades** del usuario

## 🚀 Endpoints disponibles

```bash
# 1. Saludo personalizado
GET /api/ai-chat/greeting?platform=PitsApp

# 2. Sugerencias de talleres (usa buscar_talleres tool)
POST /api/ai-chat/suggest-workshops
{
  "message": "Necesito cambio de aceite en Medellín"
}

# 3. Sugerencias de repuestos (usa buscar_repuestos tool)
POST /api/ai-chat/suggest-parts
{
  "message": "Necesito llantas Michelin"
}

# 4. Chat general (usa todas las tools disponibles)
POST /api/ai-chat/message
{
  "message": "¿Qué talleres me recomiendan para frenos?",
  "conversationHistory": []
}

# 5. Analizar necesidades
POST /api/ai-chat/analyze-needs
{
  "description": "Mi carro hace un ruido extraño al frenar"
}
```

## 📊 Logs útiles

El sistema genera logs para debug:

```
🤖 Procesando mensaje con OpenAI + Tools
🔧 [TOOL LLAMADA] buscar_talleres(ciudad="Medellín", especialidad="frenos")
✅ [TOOL RESULTADO] 3 talleres encontrados
🔧 Modelo decidió usar 1 tool(s)
```

## 🔒 Seguridad

⚠️ **NUNCA** subas tu API key a GitHub:
- Agrégala al `.gitignore`
- Usa variables de entorno
- Rota la key si se expone

```bash
# Agregar al .gitignore
echo ".env" >> .gitignore
```

## 📚 Más información

- [OpenAI API Docs](https://platform.openai.com/docs)
- [LangChain Docs](https://js.langchain.com/docs/)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
