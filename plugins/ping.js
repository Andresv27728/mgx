export default {
  command: 'ping',
  category: 'General',
  description: 'Verifica la latencia y velocidad de respuesta del bot',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const start = Date.now()
    
    const sentMsg = await sock.sendMessage(jid, {
      text: '🏓 Calculando ping...'
    })
    
    const end = Date.now()
    const latency = end - start
    
    let status = ''
    if (latency < 100) status = '🟢 Excelente'
    else if (latency < 300) status = '🟡 Bueno'
    else if (latency < 500) status = '🟠 Regular'
    else status = '🔴 Lento'
    
    const pingText = `🏓 *PING DEL BOT*\n\n`
      + `⚡ *Latencia:* ${latency}ms\n`
      + `📊 *Estado:* ${status}\n`
      + `⏰ *Tiempo:* ${new Date().toLocaleTimeString('es-ES')}\n\n`
      + `> Bot funcionando correctamente ✅`
    
    await sock.sendMessage(jid, {
      text: pingText,
      edit: sentMsg.key
    })
  }
}