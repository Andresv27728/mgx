export default {
  command: 'admins',
  category: 'Administración de Grupo',
  description: 'Menciona a todos los administradores del grupo',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    
    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, {
        text: '❌ Este comando solo funciona en grupos.'
      })
      return
    }
    
    try {
      const groupMetadata = await sock.groupMetadata(jid)
      const participants = groupMetadata.participants
      
      // Obtener administradores
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      
      if (admins.length === 0) {
        await sock.sendMessage(jid, {
          text: '❌ No hay administradores en este grupo.'
        })
        return
      }
      
      const reason = args.length > 0 ? args.join(' ') : 'Solicitud de atención'
      
      let adminText = `🚨 *LLAMADA A ADMINISTRADORES* 🚨\n\n`
      adminText += `👤 *Solicitado por:* @${sender.split('@')[0]}\n`
      adminText += `📝 *Motivo:* ${reason}\n`
      adminText += `⏰ *Hora:* ${new Date().toLocaleTimeString('es-ES')}\n\n`
      adminText += `👑 *ADMINISTRADORES DEL GRUPO:*\n`
      
      admins.forEach(admin => {
        const role = admin.admin === 'superadmin' ? '👑' : '👨‍💼'
        adminText += `${role} @${admin.id.split('@')[0]}\n`
      })
      
      adminText += `\n📢 *¡Por favor revisen el grupo!*`
      
      const mentions = [sender, ...admins.map(a => a.id)]
      
      await sock.sendMessage(jid, {
        text: adminText,
        mentions: mentions
      })
      
    } catch (error) {
      throw error
    }
  }
}