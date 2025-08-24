import config from '../config.js'
import { executeCommand } from './pluginManager.js'
import { handleButtonResponse } from './buttonHandler.js'

export async function handleMessage(sock, msg, plugins, errorHandler) {
  // Manejar respuestas de botones
  if (msg.message?.buttonsResponseMessage) {
    try {
      await handleButtonResponse(sock, msg)
    } catch (error) {
      console.error('Error en botón:', error.message)
      if (errorHandler) {
        await errorHandler.handleSystemError(error, 'Manejo de botones')
      }
    }
    return
  }

  const text = msg.message?.conversation || 
               msg.message?.extendedTextMessage?.text || 
               msg.message?.imageMessage?.caption || ''

  const sender = msg.key.remoteJid
  const isGroup = sender.endsWith('@g.us')
  
  // Extraer comando y argumentos (sin prefijo)
  const args = text.trim().split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (!command) return

  // Verificar si el comando existe en los plugins
  if (plugins.has(command)) {
    try {
      await executeCommand(sock, msg, command, args, plugins)
    } catch (error) {
      console.error(`Error ejecutando comando ${command}:`, error.message)
      if (errorHandler) {
        await errorHandler.handleCommandError(error, command, msg, args)
      }
    }
  }
}

export function isOwner(sender) {
  return sender === config.ownerNumber
}

export async function sendButtonMessage(sock, jid, text, buttons, footer = '') {
  const buttonMessage = {
    text: text,
    footer: footer,
    buttons: buttons.map((btn, index) => ({
      buttonId: btn.id || `btn_${index}`,
      buttonText: { displayText: btn.text },
      type: 1
    })),
    headerType: 1
  }

  await sock.sendMessage(jid, buttonMessage)
}

export async function sendListMessage(sock, jid, text, title, sections, footer = '') {
  const listMessage = {
    text: text,
    footer: footer,
    title: title,
    buttonText: "Ver opciones",
    sections: sections
  }

  await sock.sendMessage(jid, listMessage)
}