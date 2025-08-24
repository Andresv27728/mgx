import config from '../config.js'
import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'owner',
  category: 'General',
  description: 'Muestra información de contacto del propietario del bot',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    
    const ownerText = `👤 *INFORMACIÓN DEL PROPIETARIO*\n\n`
      + `📝 *Nombre:* ${config.ownerName}\n`
      + `🤖 *Bot:* ${config.botName}\n`
      + `📱 *WhatsApp:* ${config.ownerNumber.replace('@s.whatsapp.net', '')}\n`
      + `⚡ *Estado:* ${isOwner(sender) ? 'Eres el propietario' : 'Usuario normal'}\n\n`
      + `📞 *Para contactar:*\n`
      + `• Escribe directamente al número mostrado\n`
      + `• Menciona que vienes del bot\n\n`
      + `> Desarrollado con ❤️ para la comunidad`
    
    await sock.sendMessage(jid, { text: ownerText })
  }
}