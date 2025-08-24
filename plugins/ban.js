import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'ban',
  category: 'Administración de Grupo',
  description: 'Expulsa y evita que un usuario regrese al grupo (solo admins)',
  
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
          text: '❌ Menciona al usuario que quieres banear.\n\n*Uso:* ban @usuario [razón]'
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
          text: '❌ Usuario no encontrado.'
        })
        return
      }
      
      const reason = args.slice(1).join(' ') || 'No especificada'
      
      // Expulsar y cambiar configuración del grupo
      await sock.groupParticipantsUpdate(jid, [targetUser], 'remove')
      
      // Cambiar a solo admins pueden añadir participantes
      await sock.groupSettingUpdate(jid, 'announcement')
      
      await sock.sendMessage(jid, {
        text: `🚫 *USUARIO BANEADO*\n\n`
          + `👤 *Usuario:* @${targetUser.split('@')[0]}\n`
          + `👨‍💼 *Baneado por:* @${sender.split('@')[0]}\n`
          + `📝 *Razón:* ${reason}\n`
          + `⚙️ *Grupo configurado:* Solo admins pueden añadir participantes`,
        mentions: [sender, targetUser]
      })
      
    } catch (error) {
      throw error
    }
  }
}