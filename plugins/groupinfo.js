export default {
  command: 'groupinfo',
  category: 'Administración de Grupo',
  description: 'Muestra información detallada del grupo',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, {
        text: '❌ Este comando solo funciona en grupos.'
      })
      return
    }
    
    try {
      const groupMetadata = await sock.groupMetadata(jid)
      const participants = groupMetadata.participants
      
      // Contar tipos de participantes
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      const members = participants.filter(p => !p.admin)
      const owner = participants.find(p => p.admin === 'superadmin')
      
      // Obtener configuraciones del grupo
      const settings = {
        announce: groupMetadata.announce ? 'Solo administradores' : 'Todos los participantes',
        restrict: groupMetadata.restrict ? 'Solo administradores' : 'Todos los participantes'
      }
      
      const creationDate = new Date(groupMetadata.creation * 1000)
      
      let infoText = `📋 *INFORMACIÓN DEL GRUPO*\n\n`
      infoText += `📛 *Nombre:* ${groupMetadata.subject}\n`
      infoText += `🆔 *ID:* ${jid.split('@')[0]}\n`
      infoText += `👑 *Creador:* @${owner?.id.split('@')[0] || 'Desconocido'}\n`
      infoText += `📅 *Creado:* ${creationDate.toLocaleDateString('es-ES')}\n`
      infoText += `👥 *Participantes:* ${participants.length}\n`
      infoText += `👨‍💼 *Administradores:* ${admins.length}\n`
      infoText += `👤 *Miembros:* ${members.length}\n\n`
      
      infoText += `⚙️ *CONFIGURACIONES*\n`
      infoText += `💬 *Enviar mensajes:* ${settings.announce}\n`
      infoText += `➕ *Editar info del grupo:* ${settings.restrict}\n\n`
      
      if (groupMetadata.desc) {
        infoText += `📝 *Descripción:*\n${groupMetadata.desc}\n\n`
      }
      
      // Lista de administradores
      if (admins.length > 0) {
        infoText += `👑 *ADMINISTRADORES:*\n`
        admins.forEach(admin => {
          const role = admin.admin === 'superadmin' ? '👑' : '👨‍💼'
          infoText += `${role} @${admin.id.split('@')[0]}\n`
        })
      }
      
      const mentions = [owner?.id, ...admins.map(a => a.id)].filter(Boolean)
      
      await sock.sendMessage(jid, {
        text: infoText,
        mentions: mentions
      })
      
    } catch (error) {
      throw error
    }
  }
}