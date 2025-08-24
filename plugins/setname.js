import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'setname',
  category: 'Administración de Grupo',
  description: 'Cambia el nombre del grupo (solo admins)',
  
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
      const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
      
      const botParticipant = participants.find(p => p.id === botNumber)
      if (!botParticipant || botParticipant.admin !== 'admin') {
        await sock.sendMessage(jid, {
          text: '❌ Necesito ser administrador del grupo.'
        })
        return
      }
      
      const senderParticipant = participants.find(p => p.id === sender)
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin'
      
      if (!isAdmin && !isOwner(sender)) {
        await sock.sendMessage(jid, {
          text: '❌ Solo los administradores pueden usar este comando.'
        })
        return
      }
      
      if (args.length === 0) {
        await sock.sendMessage(jid, {
          text: '❌ Debes proporcionar un nuevo nombre para el grupo.\n\n*Uso:* setname [nuevo nombre]'
        })
        return
      }
      
      const newName = args.join(' ')
      const oldName = groupMetadata.subject
      
      if (newName.length > 25) {
        await sock.sendMessage(jid, {
          text: '❌ El nombre del grupo no puede tener más de 25 caracteres.'
        })
        return
      }
      
      // Cambiar nombre del grupo
      await sock.groupUpdateSubject(jid, newName)
      
      await sock.sendMessage(jid, {
        text: `✏️ *NOMBRE DEL GRUPO ACTUALIZADO*\n\n`
          + `📛 *Nombre anterior:* ${oldName}\n`
          + `📛 *Nuevo nombre:* ${newName}\n`
          + `👨‍💼 *Cambiado por:* @${sender.split('@')[0]}\n`
          + `⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}`,
        mentions: [sender]
      })
      
    } catch (error) {
      throw error
    }
  }
}