import axios from 'axios'
import ytSearch from 'yt-search'
import config from '../config.js'

export async function handleButtonResponse(sock, msg) {
  const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId
  if (!buttonId) return

  const jid = msg.key.remoteJid

  try {
    // Manejar botones de descarga de audio/video
    if (buttonId.startsWith('audio_') || buttonId.startsWith('video_')) {
      const [type, videoId] = buttonId.split('_')
      
      await sock.sendMessage(jid, {
        text: config.messages.downloading
      })

      // Obtener información del video
      const searchResults = await ytSearch({ videoId })
      const video = searchResults.videos[0]

      if (!video) {
        await sock.sendMessage(jid, {
          text: config.messages.notFound
        })
        return
      }

      const apiUrl = type === 'audio' ? config.ytmp3API : config.ytmp4API
      const response = await axios.get(`${apiUrl}?url=${encodeURIComponent(video.url)}`)
      
      if (response.data && response.data.download) {
        await sock.sendMessage(jid, {
          text: config.messages.uploading
        })

        if (type === 'audio') {
          await sock.sendMessage(jid, {
            audio: { url: response.data.download },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
          })
        } else {
          await sock.sendMessage(jid, {
            video: { url: response.data.download },
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`,
            caption: `🎬 *${video.title}*\n👤 ${video.author.name}`
          })
        }
      } else {
        await sock.sendMessage(jid, {
          text: '❌ Error al descargar el archivo. Inténtalo de nuevo.'
        })
      }
    }

    // Manejar otros botones del menú
    switch (buttonId) {
      case 'info':
        await executeCommand(sock, msg, 'info', [])
        break
      case 'help':
        await executeCommand(sock, msg, 'help', [])
        break
      case 'owner':
        await executeCommand(sock, msg, 'owner', [])
        break
    }

  } catch (error) {
    console.error('Error manejando botón:', error)
    await sock.sendMessage(jid, {
      text: config.messages.error
    })
  }
}

async function executeCommand(sock, msg, command, args) {
  const { loadPlugins } = await import('./pluginManager.js')
  const plugins = new Map()
  await loadPlugins(plugins)
  
  const plugin = plugins.get(command)
  if (plugin) {
    await plugin.execute(sock, msg, args)
  }
}