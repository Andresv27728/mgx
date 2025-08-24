import { Terminal } from '../lib/terminal.js'
import { isOwner } from '../lib/messageHandler.js'
import config from '../config.js'

export default {
  command: 'update',
  category: 'Administración',
  description: 'Actualiza el bot desde el repositorio de GitHub (solo owner)',
  
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
    
    try {
      // Enviar mensaje de inicio
      await sock.sendMessage(jid, {
        text: '🔄 *INICIANDO ACTUALIZACIÓN*\n\n⏳ Verificando repositorio...'
      })
      
      // Verificar si estamos en un repositorio git
      const terminal = new Terminal()
      const gitStatus = await terminal.run('git status')
      
      if (gitStatus.includes('not a git repository')) {
        await sock.sendMessage(jid, {
          text: '❌ *ERROR*\n\nEste proyecto no está vinculado a un repositorio Git.\n\n*Para usar update:*\n1. Inicializa git: `git init`\n2. Añade remote: `git remote add origin [url]`\n3. Haz push inicial: `git push -u origin main`'
        })
        return
      }
      
      // Hacer backup de archivos importantes
      await sock.sendMessage(jid, {
        text: '💾 Creando backup de configuración...'
      })
      
      await terminal.run('cp config.js config.backup.js')
      await terminal.run('cp -r session session_backup 2>/dev/null || true')
      
      // Obtener información actual
      const currentBranch = await terminal.run('git branch --show-current')
      const currentCommit = await terminal.run('git rev-parse --short HEAD')
      
      await sock.sendMessage(jid, {
        text: `📊 *INFORMACIÓN ACTUAL*\n\n🌿 Rama: ${currentBranch.trim()}\n📝 Commit: ${currentCommit.trim()}\n\n⬇️ Descargando actualizaciones...`
      })
      
      // Fetch y pull desde el repositorio
      await terminal.run('git fetch origin')
      const pullResult = await terminal.run('git pull origin ' + currentBranch.trim())
      
      if (pullResult.includes('Already up to date') || pullResult.includes('Ya está actualizado')) {
        await sock.sendMessage(jid, {
          text: '✅ *BOT ACTUALIZADO*\n\n🎉 El bot ya está en la versión más reciente.\n\n📋 No hay cambios nuevos disponibles.'
        })
        return
      }
      
      // Verificar si hay conflictos
      if (pullResult.includes('CONFLICT') || pullResult.includes('error')) {
        await sock.sendMessage(jid, {
          text: '⚠️ *CONFLICTOS DETECTADOS*\n\n❌ Hay conflictos en la actualización.\n\n*Solución:*\n1. Resuelve manualmente los conflictos\n2. O restaura backup: `mv config.backup.js config.js`\n3. Reinicia el bot'
        })
        return
      }
      
      // Actualizar dependencias
      await sock.sendMessage(jid, {
        text: '📦 Actualizando dependencias...'
      })
      
      const npmUpdate = await terminal.run('npm install')
      
      if (npmUpdate.includes('error') || npmUpdate.includes('ERR!')) {
        await sock.sendMessage(jid, {
          text: '⚠️ *ADVERTENCIA*\n\nHubo problemas actualizando dependencias.\n\n*Recomendación:*\nEjecuta manualmente: `npm install --force`'
        })
      }
      
      // Restaurar configuración si existe backup
      const configBackupExists = await terminal.run('ls config.backup.js 2>/dev/null || echo "no existe"')
      if (!configBackupExists.includes('no existe')) {
        await terminal.run('cp config.backup.js config.js')
        await sock.sendMessage(jid, {
          text: '🔧 Configuración personal restaurada.'
        })
      }
      
      // Obtener información de la nueva versión
      const newCommit = await terminal.run('git rev-parse --short HEAD')
      const commitDiff = await terminal.run(`git log --oneline ${currentCommit.trim()}..${newCommit.trim()}`)
      
      let updateMessage = '✅ *ACTUALIZACIÓN COMPLETADA*\n\n'
      updateMessage += `🆕 Nueva versión: ${newCommit.trim()}\n`
      updateMessage += `📝 Cambios anteriores: ${currentCommit.trim()}\n\n`
      
      if (commitDiff.trim()) {
        const changes = commitDiff.trim().split('\n').slice(0, 5) // Mostrar solo 5 cambios más recientes
        updateMessage += '📋 *Cambios recientes:*\n'
        changes.forEach(change => {
          updateMessage += `• ${change}\n`
        })
        
        if (commitDiff.split('\n').length > 5) {
          updateMessage += `• ... y ${commitDiff.split('\n').length - 5} cambios más\n`
        }
      }
      
      updateMessage += '\n🔄 *REINICIA EL BOT* para aplicar cambios completos.\n\n'
      updateMessage += '*Comandos para reiniciar:*\n'
      updateMessage += '• `npm start` (nuevo terminal)\n'
      updateMessage += '• `pm2 restart bot` (si usas PM2)'
      
      await sock.sendMessage(jid, { text: updateMessage })
      
      // Limpiar archivos de backup después de éxito
      await terminal.run('rm -f config.backup.js')
      
    } catch (error) {
      console.error('Error en actualización:', error)
      
      await sock.sendMessage(jid, {
        text: `❌ *ERROR EN ACTUALIZACIÓN*\n\n💔 ${error.message}\n\n*Restaurar backup:*\n• \`mv config.backup.js config.js\`\n• \`cp -r session_backup session\`\n• Reinicia el bot`
      })
    }
  }
}