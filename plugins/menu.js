import config from '../config.js'
import { sendButtonMessage } from '../lib/messageHandler.js'

export default {
  command: 'menu',
  category: 'General',
  description: 'Muestra el menú principal con todos los comandos disponibles',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    // Obtener todos los plugins cargados
    const { loadPlugins } = await import('../lib/pluginManager.js')
    const plugins = new Map()
    await loadPlugins(plugins)
    
    // Agrupar comandos por categoría
    const categories = {}
    
    for (const [command, plugin] of plugins) {
      const category = plugin.category || 'General'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push({
        command: plugin.command,
        description: plugin.description || 'Sin descripción'
      })
    }
    
    // Crear mensaje del menú
    let menuText = `╭─「 *${config.botName}* 」\n`
    menuText += `│ 👋 ¡Hola! Soy tu asistente virtual\n`
    menuText += `│ 📱 Bot creado por: ${config.ownerName}\n`
    menuText += `│ ⏰ Fecha: ${new Date().toLocaleDateString('es-ES')}\n`
    menuText += `╰────────────────\n\n`
    
    for (const [categoryName, commands] of Object.entries(categories)) {
      menuText += `╭─「 *${categoryName}* 」\n`
      commands.forEach(cmd => {
        menuText += `│ ◦ *${cmd.command}*\n│   ${cmd.description}\n`
      })
      menuText += `╰────────────────\n\n`
    }
    
    menuText += `> *Nota:* No necesitas usar prefijos, solo escribe el comando directamente.`
    
    const buttons = [
      { id: 'info', text: '📋 Info del Bot' },
      { id: 'help', text: '❓ Ayuda' },
      { id: 'owner', text: '👤 Contactar Owner' }
    ]
    
    await sendButtonMessage(sock, jid, menuText, buttons, `${config.botName} - Menu Principal`)
  }
}