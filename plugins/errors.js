import { isOwner } from '../lib/messageHandler.js'
import config from '../config.js'

export default {
  command: 'errors',
  category: 'Administración',
  description: 'Prueba el sistema de notificación de errores (solo owner)',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    
    // Verificar que solo el owner pueda usar este comando
    if (!isOwner(sender)) {
      await sock.sendMessage(jid, {
        text: config.messages.ownerOnly
      })
      return
    }
    
    if (args.length === 0) {
      await sock.sendMessage(jid, {
        text: '🧪 *SISTEMA DE ERRORES*\n\n*Comandos disponibles:*\n• errors test - Generar error de prueba\n• errors info - Información del sistema\n• errors status - Estado del manejador'
      })
      return
    }
    
    switch (args[0]) {
      case 'test':
        try {
          // Generar un error intencionalmente
          throw new Error('Error de prueba generado por el comando errors test')
        } catch (error) {
          // El error será capturado por el sistema y enviado automáticamente
          throw error
        }
        break
        
      case 'info':
        await sock.sendMessage(jid, {
          text: '📊 *INFORMACIÓN DEL SISTEMA DE ERRORES*\n\n'
            + '✅ *Estado:* Activo\n'
            + '📱 *Notificaciones:* Habilitadas\n'
            + '👤 *Owner:* ' + config.ownerNumber + '\n'
            + '🔄 *Auto-reporte:* Sí\n'
            + '📝 *Contexto:* Incluido\n\n'
            + '*Tipos de errores monitoreados:*\n'
            + '• Errores de comandos\n'
            + '• Errores del sistema\n'
            + '• Promesas no manejadas\n'
            + '• Excepciones no capturadas'
        })
        break
        
      case 'status':
        await sock.sendMessage(jid, {
          text: '🟢 *SISTEMA DE ERRORES OPERATIVO*\n\n'
            + '⚡ El bot reportará automáticamente:\n'
            + '• Errores en comandos\n'
            + '• Fallos del sistema\n'
            + '• Problemas de conexión\n\n'
            + '📬 *Destino:* ' + config.ownerNumber + '\n'
            + '🕐 *Timestamp:* Incluido\n'
            + '📄 *Stack trace:* Incluido'
        })
        break
        
      default:
        await sock.sendMessage(jid, {
          text: '❌ Opción no válida.\n\n*Uso:* errors [test|info|status]'
        })
    }
  }
}