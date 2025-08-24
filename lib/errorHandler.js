import config from '../config.js'

class ErrorHandler {
  constructor(sock) {
    this.sock = sock
  }

  async sendErrorToOwner(error, context = '') {
    try {
      const errorMessage = `🚨 *ERROR EN EL BOT* 🚨\n\n`
        + `⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}\n`
        + `📍 *Contexto:* ${context || 'Error general'}\n`
        + `❌ *Error:* ${error.message || error}\n`
        + `📄 *Stack:* \`\`\`${error.stack || 'No disponible'}\`\`\`\n\n`
        + `🔧 *Recomendación:* Revisar logs y reiniciar si es necesario.`

      await this.sock.sendMessage(config.ownerNumber, {
        text: errorMessage
      })
    } catch (sendError) {
      console.error('❌ Error enviando notificación al owner:', sendError.message)
    }
  }

  async handleCommandError(error, command, msg, args) {
    const context = `Comando: ${command} | Usuario: ${msg.key.remoteJid} | Args: ${args.join(' ')}`
    
    // Enviar error al owner
    await this.sendErrorToOwner(error, context)
    
    // Enviar mensaje genérico al usuario
    try {
      await this.sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Ocurrió un error inesperado. El propietario del bot ha sido notificado automáticamente.'
      })
    } catch (userError) {
      console.error('❌ Error enviando mensaje al usuario:', userError.message)
    }
  }

  async handleSystemError(error, context) {
    await this.sendErrorToOwner(error, `Sistema: ${context}`)
  }
}

export default ErrorHandler