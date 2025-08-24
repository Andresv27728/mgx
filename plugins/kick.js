import { isOwner } from '../lib/messageHandler.js'
import config from '../config.js'

export default {
  command: 'kick',
  category: 'Administración de Grupo',
  description: 'Expulsa a un usuario del grupo (solo admins)',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    
    // Verificar que es un grupo
    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, {
        text: '❌ Este comando solo funciona en grupos.'
      })
      return
    }
    
    try {
      // Obtener metadata del grupo
      const groupMetadata = await sock.groupMetadata(jid)
      const participants = groupMetadata.participants
      const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
      
      // Verificar si el bot es admin
      const botParticipant = participants.find(p => p.id === botNumber)
      if (!botParticipant || botParticipant.admin !== 'admin') {
        await sock.sendMessage(jid, {
          text: '❌ Necesito ser administrador del grupo para expulsar usuarios.'
        })
        return
      }
      
      // Verificar si el usuario es admin o owner
      const senderParticipant = participants.find(p => p.id === sender)
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin'
      const isOwnerBot = isOwner(sender)
      
      if (!isAdmin && !isOwnerBot) {
        await sock.sendMessage(jid, {
          text: '❌ Solo los administradores pueden usar este comando.'
        })
        return
      }
      
      // Verificar argumentos
      if (args.length === 0) {
        await sock.sendMessage(jid, {
          text: '❌ Debes mencionar o responder al usuario que quieres expulsar.\n\n*Uso:* kick @usuario'
        })
        return
      }
      
      let targetUser
      
      // Verificar si es una respuesta a un mensaje
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      if (quotedMsg) {
        targetUser = msg.message.extendedTextMessage.contextInfo.participant
      } else {
        // Buscar menciones
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
        if (mentions && mentions.length > 0) {
          targetUser = mentions[0]
        }
      }
      
      if (!targetUser) {
        await sock.sendMessage(jid, {
          text: '❌ Usuario no encontrado. Menciona al usuario o responde a su mensaje.'
        })
        return
      }
      
      // Verificar que no sea el bot mismo
      if (targetUser === botNumber) {
        await sock.sendMessage(jid, {
          text: '❌ No puedo expulsarme a mí mismo.'
        })
        return
      }
      
      // Verificar que el objetivo no sea admin (a menos que sea el owner del bot)
      const targetParticipant = participants.find(p => p.id === targetUser)
      if (targetParticipant?.admin && !isOwnerBot) {
        await sock.sendMessage(jid, {
          text: '❌ No puedes expulsar a otro administrador.'
        })
        return
      }
      
      // Expulsar usuario
      await sock.groupParticipantsUpdate(jid, [targetUser], 'remove')
      
      await sock.sendMessage(jid, {
        text: `✅ Usuario expulsado del grupo.\n\n👤 *Expulsado por:* @${sender.split('@')[0]}\n🚫 *Usuario:* @${targetUser.split('@')[0]}`,
        mentions: [sender, targetUser]
      })
      
    } catch (error) {
      console.error('Error en kick:', error)
      await sock.sendMessage(jid, {
        text: '❌ Error al expulsar al usuario. Verifica que tenga los permisos necesarios.'
      })
    }
  }
}