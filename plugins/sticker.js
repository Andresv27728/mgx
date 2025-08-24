export default {
  command: 'sticker',
  category: 'Utilidades',
  description: 'Convierte imágenes en stickers para WhatsApp',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    // Verificar si hay una imagen
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage
    
    if (!imageMsg) {
      await sock.sendMessage(jid, {
        text: '❌ Por favor responde a una imagen o envía una imagen con el comando sticker\n\n*Uso:* Envía o responde a una imagen y escribe "sticker"'
      })
      return
    }
    
    try {
      await sock.sendMessage(jid, {
        text: '⏳ Creando sticker...'
      })
      
      // Descargar la imagen
      const buffer = await sock.downloadMediaMessage(
        quotedMsg ? { message: quotedMsg } : msg
      )
      
      // Crear y enviar el sticker
      await sock.sendMessage(jid, {
        sticker: buffer,
        mimetype: 'image/webp'
      })
      
    } catch (error) {
      console.error('Error creando sticker:', error)
      await sock.sendMessage(jid, {
        text: '❌ Error al crear el sticker. Asegúrate de que sea una imagen válida.'
      })
    }
  }
}