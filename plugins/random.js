export default {
  command: 'random',
  category: 'Diversión',
  description: 'Genera números aleatorios o elige opciones al azar',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (args.length === 0) {
      // Número aleatorio simple del 1 al 100
      const randomNum = Math.floor(Math.random() * 100) + 1
      
      await sock.sendMessage(jid, {
        text: `🎲 *NÚMERO ALEATORIO*\n\n🔢 Tu número es: *${randomNum}*\n\n*Otros usos:*\n• random 1 10 (número entre 1 y 10)\n• random sí no (elegir entre opciones)`
      })
      return
    }
    
    // Si son números, generar entre rango
    if (args.length === 2 && !isNaN(args[0]) && !isNaN(args[1])) {
      const min = parseInt(args[0])
      const max = parseInt(args[1])
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
      
      await sock.sendMessage(jid, {
        text: `🎲 *NÚMERO ALEATORIO*\n\n📊 Rango: ${min} - ${max}\n🔢 Resultado: *${randomNum}*`
      })
      return
    }
    
    // Elegir entre opciones
    const options = args
    const chosen = options[Math.floor(Math.random() * options.length)]
    
    const optionsText = `🎭 *ELECCIÓN ALEATORIA*\n\n`
      + `📝 *Opciones:* ${options.join(', ')}\n`
      + `✨ *Elegido:* *${chosen}*\n\n`
      + `> El destino ha decidido por ti 🎯`
    
    await sock.sendMessage(jid, { text: optionsText })
  }
}