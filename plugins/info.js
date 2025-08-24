import config from '../config.js'
import { performance } from 'perf_hooks'

export default {
  command: 'info',
  category: 'General',
  description: 'Muestra información del bot y estadísticas del sistema',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()
    
    const uptimeFormatted = formatUptime(uptime)
    
    const infoText = `╭─「 *INFORMACIÓN DEL BOT* 」\n`
      + `│ 🤖 *Nombre:* ${config.botName}\n`
      + `│ 👤 *Propietario:* ${config.ownerName}\n`
      + `│ ⏰ *Tiempo activo:* ${uptimeFormatted}\n`
      + `│ 💾 *Memoria usada:* ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`
      + `│ 📱 *Plataforma:* ${process.platform}\n`
      + `│ 🟢 *Node.js:* ${process.version}\n`
      + `│ 📊 *Estado:* Activo y funcionando\n`
      + `│ 🌐 *Conexión:* WhatsApp Web\n`
      + `╰────────────────\n\n`
      + `*Características:*\n`
      + `✅ Botones interactivos\n`
      + `✅ Sistema de plugins\n`
      + `✅ Descarga de música/video\n`
      + `✅ Comandos sin prefijo\n`
      + `✅ Menú automático\n\n`
      + `> Bot creado con ❤️ usando Baileys`
    
    await sock.sendMessage(jid, { text: infoText })
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  let result = ''
  if (days > 0) result += `${days}d `
  if (hours > 0) result += `${hours}h `
  if (minutes > 0) result += `${minutes}m `
  result += `${secs}s`
  
  return result.trim()
}