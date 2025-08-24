import axios from 'axios'
import ytSearch from 'yt-search'
import config from '../config.js'
import { sendButtonMessage } from '../lib/messageHandler.js'

export default {
  command: 'play',
  category: 'Descargas',
  description: 'Busca y descarga música o videos de YouTube',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (args.length === 0) {
      await sock.sendMessage(jid, {
        text: '❌ Por favor proporciona el nombre de la canción.\n\n*Ejemplo:* play despacito'
      })
      return
    }
    
    const query = args.join(' ')
    
    try {
      // Enviar mensaje de búsqueda
      await sock.sendMessage(jid, {
        text: `🔍 Buscando: *${query}*...`
      })
      
      // Buscar en YouTube
      const searchResults = await ytSearch(query)
      const video = searchResults.videos[0]
      
      if (!video) {
        await sock.sendMessage(jid, {
          text: '❌ No se encontraron resultados para tu búsqueda.'
        })
        return
      }
      
      // Información de la canción
      const info = `🎵 *Información de la canción*\n\n`
        + `📝 *Título:* ${video.title}\n`
        + `👤 *Autor:* ${video.author.name}\n`
        + `⏱️ *Duración:* ${video.timestamp}\n`
        + `👀 *Visualizaciones:* ${video.views.toLocaleString()}\n`
        + `📅 *Publicado:* ${video.ago}\n`
        + `🔗 *URL:* ${video.url}\n\n`
        + `Selecciona el formato que deseas descargar:`
      
      const buttons = [
        { 
          id: `audio_${video.videoId}`, 
          text: '🎵 Descargar Audio' 
        },
        { 
          id: `video_${video.videoId}`, 
          text: '📹 Descargar Video' 
        }
      ]
      
      await sendButtonMessage(sock, jid, info, buttons, `${config.botName} - Descargador`)
      
    } catch (error) {
      console.error('Error en play:', error)
      await sock.sendMessage(jid, {
        text: '❌ Ocurrió un error al buscar la canción. Inténtalo de nuevo.'
      })
    }
  }
}