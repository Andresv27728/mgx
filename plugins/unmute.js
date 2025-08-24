import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'unmute',
  category: 'Administración de Grupo',
  description: 'Desactiva el silencio del grupo (todos pueden escribir)',
  
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
      
      // Verificar si no está silenciado
      if (!groupMetadata.announce) {
        await sock.sendMessage(jid, {
          text: '❌ El grupo no está silenciado.'
        })
        return
      }
      
      // Desactivar silencio
      await sock.groupSettingUpdate(jid, 'not_announcement')
      
      await sock.sendMessage(jid, {
        text: `🔊 *GRUPO REACTIVADO*\n\n`
          + `📢 Todos los participantes pueden enviar mensajes nuevamente.\n`
          + `👨‍💼 *Reactivado por:* @${sender.split('@')[0]}\n`
          + `⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}\n\n`
          + `🎉 ¡El chat está activo!`,
        mentions: [sender]
      })
      
    } catch (error) {
      throw error
    }
  }
}