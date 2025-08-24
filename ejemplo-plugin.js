// 📝 EJEMPLO: Cómo crear un plugin personalizado
// Guarda este archivo en la carpeta 'plugins/' para que funcione

export default {
  // Nombre del comando (sin prefijos)
  command: 'ejemplo',
  
  // Categoría para el menú automático
  category: 'Ejemplos',
  
  // Descripción que aparecerá en el menú
  description: 'Plugin de ejemplo para demostrar la funcionalidad',
  
  // Función principal que se ejecuta al usar el comando
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid // Chat donde se envió el mensaje
    
    // Ejemplo 1: Mensaje simple
    if (args.length === 0) {
      await sock.sendMessage(jid, {
        text: '🎯 ¡Este es un plugin de ejemplo!\n\nUsa: ejemplo hola [nombre]'
      })
      return
    }
    
    // Ejemplo 2: Usar argumentos
    if (args[0] === 'hola') {
      const nombre = args.slice(1).join(' ') || 'Usuario'
      await sock.sendMessage(jid, {
        text: `👋 ¡Hola ${nombre}! Bienvenido al bot.`
      })
      return
    }
    
    // Ejemplo 3: Botones interactivos
    if (args[0] === 'botones') {
      const buttons = [
        { id: 'btn1', text: '✅ Opción 1' },
        { id: 'btn2', text: '❌ Opción 2' }
      ]
      
      await sock.sendMessage(jid, {
        text: 'Elige una opción:',
        footer: 'Ejemplo de botones',
        buttons: buttons.map((btn, index) => ({
          buttonId: btn.id,
          buttonText: { displayText: btn.text },
          type: 1
        })),
        headerType: 1
      })
      return
    }
    
    // Ejemplo 4: Validación y error
    await sock.sendMessage(jid, {
      text: '❌ Opción no válida.\n\n*Opciones disponibles:*\n• ejemplo hola [nombre]\n• ejemplo botones'
    })
  }
}

// 🔧 INSTRUCCIONES DE USO:
// 1. Copia este archivo a la carpeta 'plugins/'
// 2. Renómbralo (ej: 'micomando.js')
// 3. Cambia el 'command' por tu comando deseado
// 4. Reinicia el bot
// 5. El comando aparecerá automáticamente en el menú