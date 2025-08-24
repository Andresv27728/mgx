import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import config from './config.js'
import { loadPlugins, executeCommand } from './lib/pluginManager.js'
import { handleMessage } from './lib/messageHandler.js'
import ErrorHandler from './lib/errorHandler.js'

const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath)

let sock
let errorHandler
const plugins = new Map()

async function startBot() {
  try {
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: {
        level: 'silent'
      }
    })

    // Inicializar manejador de errores
    errorHandler = new ErrorHandler(sock)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr) {
      console.log(chalk.yellow('Escanea el código QR con WhatsApp:'))
      qrcode.generate(qr, { small: true })
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(chalk.red('Conexión cerrada debido a'), lastDisconnect.error, chalk.yellow('Reconectando...'), shouldReconnect)
      
      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === 'open') {
      console.log(chalk.green(`✓ Bot conectado como ${config.botName}`))
      console.log(chalk.blue('Bot listo para recibir mensajes'))
    }
  })

  sock.ev.on('creds.update', saveCreds)
  
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0]
      if (!msg.message || msg.key.fromMe) return
      
      await handleMessage(sock, msg, plugins, errorHandler)
    } catch (error) {
      console.error(chalk.red('Error procesando mensaje:'), error.message)
      if (errorHandler) {
        await errorHandler.handleSystemError(error, 'Procesamiento de mensajes')
      }
    }
  })

    // Cargar plugins
    await loadPlugins(plugins)
    console.log(chalk.cyan(`Plugins cargados: ${plugins.size}`))

  } catch (error) {
    console.error(chalk.red('Error crítico iniciando bot:'), error.message)
    if (errorHandler) {
      await errorHandler.handleSystemError(error, 'Inicio del bot')
    }
    // Reintentar conexión después de 10 segundos
    setTimeout(startBot, 10000)
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', async (error) => {
  console.error(chalk.red('Promesa no manejada:'), error)
  if (errorHandler) {
    await errorHandler.handleSystemError(error, 'Promesa no manejada')
  }
})

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('Excepción no capturada:'), error)
  if (errorHandler) {
    await errorHandler.handleSystemError(error, 'Excepción no capturada')
  }
  process.exit(1)
})

startBot()

export { sock }