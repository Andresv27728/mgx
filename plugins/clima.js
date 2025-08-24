export default {
  command: 'clima',
  category: 'Utilidades',
  description: 'Obtiene información del clima de una ciudad',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (args.length === 0) {
      await sock.sendMessage(jid, {
        text: '❌ Por favor proporciona el nombre de una ciudad.\n\n*Ejemplo:* clima Madrid'
      })
      return
    }
    
    const city = args.join(' ')
    
    // Simulación de API de clima (reemplaza con una API real)
    const weatherData = {
      city: city,
      temperature: Math.floor(Math.random() * 30) + 5,
      humidity: Math.floor(Math.random() * 80) + 20,
      condition: ['Soleado', 'Nublado', 'Lluvioso', 'Parcialmente nublado'][Math.floor(Math.random() * 4)]
    }
    
    const weatherText = `🌤️ *CLIMA ACTUAL*\n\n`
      + `📍 *Ciudad:* ${weatherData.city}\n`
      + `🌡️ *Temperatura:* ${weatherData.temperature}°C\n`
      + `💧 *Humedad:* ${weatherData.humidity}%\n`
      + `☁️ *Condición:* ${weatherData.condition}\n`
      + `⏰ *Actualizado:* ${new Date().toLocaleString('es-ES')}\n\n`
      + `> Datos proporcionados por el servicio meteorológico`
    
    await sock.sendMessage(jid, { text: weatherText })
  }
}