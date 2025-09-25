export default {
  // Configuración del bot
  botName: "MiBot WhatsApp",
  ownerName: "Propietario del Bot",
  ownerNumber: "573133374132@s.whatsapp.net", // Cambia por tu número
  
  // APIs
  ytmp3API: "https://myapiadonix.vercel.app/api/ytmp3",
  ytmp4API: "https://myapiadonix.vercel.app/api/ytmp4",
  
  // Configuración de sesión
  sessionPath: "./session",
  
  // Mensajes del sistema
  messages: {
    welcome: "¡Hola! Soy {botName}. Envía 'menu' para ver los comandos disponibles.",
    error: "❌ Ocurrió un error al procesar tu solicitud.",
    processing: "⏳ Procesando tu solicitud...",
    downloading: "📥 Descargando...",
    uploading: "📤 Enviando archivo...",
    notFound: "❌ No se encontró lo que buscas.",
    ownerOnly: "❌ Este comando solo está disponible para el propietario del bot."
  }
}