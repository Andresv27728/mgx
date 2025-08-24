import { isOwner } from '../lib/messageHandler.js'

export default {
  command: 'setdesc',
  category: 'Administración de Grupo',
  description: 'Cambia la descripción del grupo (solo admins)',
  
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
          text: '❌ Debes proporcionar una nueva descripción para el grupo.\n\n*Uso:* setdesc [nueva descripción]\n\n*Para eliminar:* setdesc clear'
        })
        return
      }
      
      let newDesc = args.join(' ')
      const oldDesc = groupMetadata.desc || 'Sin descripción'
      
      // Verificar comando especial para limpiar
      if (newDesc.toLowerCase() === 'clear') {
        newDesc = ''
      }
      
      if (newDesc.length > 512) {
        await sock.sendMessage(jid, {
          text: '❌ La descripción no puede tener más de 512 caracteres.'
        })
        return
      }
      
      // Cambiar descripción del grupo
      await sock.groupUpdateDescription(jid, newDesc)
      
      let responseText = `📝 *DESCRIPCIÓN DEL GRUPO ACTUALIZADA*\n\n`
      responseText += `📄 *Descripción anterior:* ${oldDesc}\n`
      
      if (newDesc) {
        responseText += `📄 *Nueva descripción:* ${newDesc}\n`
      } else {
        responseText += `📄 *Nueva descripción:* Eliminada\n`
      }
      
      responseText += `👨‍💼 *Cambiado por:* @${sender.split('@')[0]}\n`
      responseText += `⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}`
      
      await sock.sendMessage(jid, {
        text: responseText,
        mentions: [sender]
      })
      
    } catch (error) {
      throw error
    }
  }
}