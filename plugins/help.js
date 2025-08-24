export default {
  command: 'help',
  category: 'General',
  description: 'Muestra ayuda detallada sobre cómo usar el bot',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    const helpText = `╭─「 *GUÍA DE USO* 」\n`
      + `│\n`
      + `│ 📝 *Cómo usar el bot:*\n`
      + `│ • No necesitas prefijos (!,/,.)\n`
      + `│ • Escribe directamente el comando\n`
      + `│ • Ejemplo: menu, play, info\n`
      + `│\n`
      + `│ 🎵 *Para descargar música:*\n`
      + `│ • Escribe: play [nombre canción]\n`
      + `│ • Ejemplo: play despacito\n`
      + `│ • Selecciona audio o video\n`
      + `│\n`
      + `│ 📋 *Comandos principales:*\n`
      + `│ • menu - Ver todos los comandos\n`
      + `│ • play - Descargar música/video\n`
      + `│ • info - Información del bot\n`
      + `│ • ping - Verificar velocidad\n`
      + `│ • help - Esta ayuda\n`
      + `│\n`
      + `│ 🔘 *Botones interactivos:*\n`
      + `│ • Toca los botones para opciones\n`
      + `│ • Más fácil que escribir comandos\n`
      + `│\n`
      + `╰────────────────\n\n`
      + `❓ *¿Problemas?* Contacta al owner del bot\n`
      + `💡 *Tip:* Usa 'menu' para ver todos los comandos disponibles`
    
    await sock.sendMessage(jid, { text: helpText })
  }
}