import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'demote',
  category: 'Administración de Grupo',
  description: 'Remueve los permisos de administrador a un usuario (solo admins)',
  
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
          text: '❌ Menciona al usuario que quieres degradar.\n\n*Uso:* demote @usuario'
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
      
      // Verificar que sea admin
      if (!targetParticipant.admin) {
        await sock.sendMessage(jid, {
          text: '❌ El usuario no es administrador.'
        })
        return
      }
      
      // No permitir degradar al creador del grupo (a menos que sea el owner del bot)
      if (targetParticipant.admin === 'superadmin' && !isOwner(sender)) {
        await sock.sendMessage(jid, {
          text: '❌ No puedes degradar al creador del grupo.'
        })
        return
      }
      
      // Degradar de admin
      await sock.groupParticipantsUpdate(jid, [targetUser], 'demote')
      
      await sock.sendMessage(jid, {
        text: `📉 *ADMINISTRADOR DEGRADADO*\n\n`
          + `👤 @${targetUser.split('@')[0]} ya no es administrador del grupo.\n`
          + `👨‍💼 *Degradado por:* @${sender.split('@')[0]}\n\n`
          + `❌ Permisos de administrador removidos.`,
        mentions: [sender, targetUser]
      })
      
    } catch (error) {
      throw error
    }
  }
}