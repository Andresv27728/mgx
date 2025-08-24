export default {
  command: 'qr',
  category: 'Utilidades',
  description: 'Genera códigos QR a partir de texto',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (args.length === 0) {
      await sock.sendMessage(jid, {
        text: '❌ Por favor proporciona el texto para generar el código QR.\n\n*Ejemplo:* qr https://google.com'
      })
      return
    }
    
    const text = args.join(' ')
    
    try {
      // URL de API para generar QR (servicio gratuito)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`
      
      await sock.sendMessage(jid, {
        text: '⏳ Generando código QR...'
      })
      
      await sock.sendMessage(jid, {
        image: { url: qrUrl },
        caption: `📱 *CÓDIGO QR GENERADO*\n\n📝 *Texto:* ${text}\n\n> Escanea el código con tu cámara`
      })
      
    } catch (error) {
      console.error('Error generando QR:', error)
      await sock.sendMessage(jid, {
        text: '❌ Error al generar el código QR. Inténtalo de nuevo.'
      })
    }
  }
}