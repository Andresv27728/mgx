import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'promote',
  category: 'Administración de Grupo',
  description: 'Promueve a un usuario a administrador (solo admins)',
  
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
      
      let targetUser
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      if (quotedMsg) {
        targetUser = msg.message.extendedTextMessage.contextInfo.participant
      } else {
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
        if (mentions && mentions.length > 0) {
          targetUser = mentions[0]
        }
      }
      
      if (!targetUser) {
        await sock.sendMessage(jid, {
          text: '❌ Menciona al usuario que quieres promover.\n\n*Uso:* promote @usuario'
        })
        return
      }
      
      // Verificar que el usuario esté en el grupo
      const targetParticipant = participants.find(p => p.id === targetUser)
      if (!targetParticipant) {
        await sock.sendMessage(jid, {
          text: '❌ El usuario no está en el grupo.'
        })
        return
      }
      
      // Verificar que no sea ya admin
      if (targetParticipant.admin) {
        await sock.sendMessage(jid, {
          text: '❌ El usuario ya es administrador.'
        })
        return
      }
      
      // Promover a admin
      await sock.groupParticipantsUpdate(jid, [targetUser], 'promote')
      
      await sock.sendMessage(jid, {
        text: `👑 *NUEVO ADMINISTRADOR*\n\n`
          + `🎉 ¡Felicidades! @${targetUser.split('@')[0]} ahora es administrador del grupo.\n`
          + `👨‍💼 *Promovido por:* @${sender.split('@')[0]}\n\n`
          + `✅ Ahora tiene permisos de administrador.`,
        mentions: [sender, targetUser]
      })
      
    } catch (error) {
      throw error
    }
  }
}