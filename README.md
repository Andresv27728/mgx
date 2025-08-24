# 🤖 WhatsApp Bot con Baileys

Un bot de WhatsApp completo con sistema de plugins, botones interactivos y descarga de multimedia, desarrollado con Baileys.

## 🌟 Características

- ✅ **Conexión con Baileys** - Conexión nativa a WhatsApp Web
- ✅ **Botones Interactivos** - Soporte completo para botones y listas
- ✅ **Sistema de Plugins** - Arquitectura modular y expandible
- ✅ **Sin Prefijos** - Comandos directos sin necesidad de símbolos
- ✅ **Menú Automático** - Generación automática basada en plugins
- ✅ **Descarga de Música/Video** - Integración con APIs de YouTube
- ✅ **Múltiples Utilidades** - Calculadora, QR, clima, stickers y más
- ✅ **Configuración Personalizable** - Fácil configuración del bot

## 🚀 Instalación

1. **Clonar o descargar el proyecto**
```bash
git clone [tu-repositorio]
cd whatsapp-bot-baileys
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar el bot**
Edita el archivo `config.js`:
```javascript
export default {
  botName: "Mi Bot Personalizado",
  ownerName: "Tu Nombre",
  ownerNumber: "1234567890@s.whatsapp.net", // Tu número con @s.whatsapp.net
  // ... resto de configuración
}
```

4. **Ejecutar el bot**
```bash
npm start
```

5. **Escanear código QR**
Escanea el código QR que aparece en la terminal con tu WhatsApp.

## 📱 Comandos Disponibles

### General
- `menu` - Muestra todos los comandos disponibles
- `info` - Información del bot y estadísticas
- `ping` - Verifica la latencia del bot
- `help` - Guía de uso detallada
- `owner` - Información de contacto del propietario

### Descargas
- `play [canción]` - Busca y descarga música/video de YouTube

### Utilidades
- `sticker` - Convierte imágenes en stickers
- `calc [operación]` - Calculadora matemática
- `clima [ciudad]` - Información del clima
- `qr [texto]` - Genera códigos QR

### Diversión
- `random` - Números aleatorios y elecciones

## 🔧 Crear Plugins Personalizados

### Estructura Básica de un Plugin

Crea un archivo `.js` en la carpeta `plugins/` con la siguiente estructura:

```javascript
export default {
  command: 'micomando',           // Nombre del comando
  category: 'Mi Categoría',       // Categoría para el menú
  description: 'Descripción del comando', // Descripción
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    // Tu lógica aquí
    await sock.sendMessage(jid, {
      text: '¡Hola desde mi plugin!'
    })
  }
}
```

### Ejemplos de Plugins

#### 1. Plugin Básico de Saludo
```javascript
// plugins/saludo.js
export default {
  command: 'saludo',
  category: 'Social',
  description: 'Envía un saludo personalizado',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    const nombre = args.join(' ') || 'Usuario'
    
    await sock.sendMessage(jid, {
      text: `¡Hola ${nombre}! 👋\n¿Cómo estás hoy?`
    })
  }
}
```

#### 2. Plugin con Botones
```javascript
// plugins/encuesta.js
import { sendButtonMessage } from '../lib/messageHandler.js'

export default {
  command: 'encuesta',
  category: 'Interactivo',
  description: 'Crea una encuesta rápida',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    const buttons = [
      { id: 'si', text: '✅ Sí' },
      { id: 'no', text: '❌ No' },
      { id: 'tal_vez', text: '🤔 Tal vez' }
    ]
    
    await sendButtonMessage(
      sock, 
      jid, 
      '📊 ¿Te gusta este bot?', 
      buttons,
      'Encuesta Rápida'
    )
  }
}
```

#### 3. Plugin con Validaciones
```javascript
// plugins/edad.js
export default {
  command: 'edad',
  category: 'Utilidades',
  description: 'Calcula tu edad en años, meses y días',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (args.length !== 3) {
      await sock.sendMessage(jid, {
        text: '❌ Formato incorrecto.\n\n*Uso:* edad DD MM YYYY\n*Ejemplo:* edad 15 05 1990'
      })
      return
    }
    
    const [dia, mes, año] = args.map(Number)
    
    if (!dia || !mes || !año || dia > 31 || mes > 12 || año > new Date().getFullYear()) {
      await sock.sendMessage(jid, {
        text: '❌ Fecha inválida. Verifica los valores ingresados.'
      })
      return
    }
    
    const fechaNacimiento = new Date(año, mes - 1, dia)
    const hoy = new Date()
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
    
    await sock.sendMessage(jid, {
      text: `🎂 *Cálculo de Edad*\n\n📅 Nacimiento: ${dia}/${mes}/${año}\n🎯 Tienes: ${edad} años\n⏰ Calculado: ${hoy.toLocaleDateString('es-ES')}`
    })
  }
}
```

#### 4. Plugin con APIs Externas
```javascript
// plugins/chiste.js
import axios from 'axios'

export default {
  command: 'chiste',
  category: 'Diversión',
  description: 'Cuenta un chiste aleatorio',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    try {
      await sock.sendMessage(jid, {
        text: '😄 Buscando un chiste...'
      })
      
      // API de chistes (ejemplo)
      const response = await axios.get('https://api.chucknorris.io/jokes/random')
      
      await sock.sendMessage(jid, {
        text: `😂 *Chiste del día*\n\n${response.data.value}\n\n> ¡Espero que te haya gustado!`
      })
    } catch (error) {
      await sock.sendMessage(jid, {
        text: '❌ No pude obtener un chiste en este momento.'
      })
    }
  }
}
```

### Funciones Útiles para Plugins

```javascript
// Verificar si es el propietario
import { isOwner } from '../lib/messageHandler.js'

if (!isOwner(msg.key.participant || msg.key.remoteJid)) {
  await sock.sendMessage(jid, {
    text: '❌ Solo el propietario puede usar este comando.'
  })
  return
}

// Enviar botones
import { sendButtonMessage } from '../lib/messageHandler.js'
await sendButtonMessage(sock, jid, texto, botones, pie)

// Enviar listas
import { sendListMessage } from '../lib/messageHandler.js'
await sendListMessage(sock, jid, texto, titulo, secciones, pie)

// Descargar media
const buffer = await sock.downloadMediaMessage(msg)

// Responder a un mensaje
await sock.sendMessage(jid, {
  text: 'Respuesta',
}, { quoted: msg })
```

## 🎯 Configuración Avanzada

### Personalizar Mensajes
Edita `config.js` para cambiar mensajes del sistema:

```javascript
messages: {
  welcome: "¡Bienvenido! Soy {botName}",
  error: "❌ Algo salió mal...",
  // ... más mensajes
}
```

### APIs Personalizadas
Cambia las URLs de las APIs en `config.js`:

```javascript
ytmp3API: "https://tu-api.com/mp3",
ytmp4API: "https://tu-api.com/mp4"
```

## 📂 Estructura del Proyecto

```
whatsapp-bot-baileys/
├── plugins/              # Comandos del bot
│   ├── menu.js          # Menú principal
│   ├── play.js          # Descarga de música
│   └── ...              # Otros plugins
├── lib/                 # Librerías del bot
│   ├── messageHandler.js # Manejo de mensajes
│   ├── pluginManager.js # Sistema de plugins
│   └── buttonHandler.js # Manejo de botones
├── session/             # Datos de sesión (auto-generado)
├── config.js            # Configuración principal
├── index.js             # Archivo principal
└── package.json         # Dependencias
```

## 🛠️ Desarrollo

### Añadir Nuevas Categorías
Solo crea plugins con nuevas categorías y aparecerán automáticamente en el menú:

```javascript
export default {
  command: 'nuevo',
  category: 'Nueva Categoría', // Se añadirá automáticamente
  // ...
}
```

### Debug y Logs
El bot muestra logs útiles en la consola para debug y monitoreo.

## ⚠️ Notas Importantes

- **Número de teléfono**: Cambia el `ownerNumber` en `config.js`
- **Sesión**: La carpeta `session/` contiene datos importantes, no la elimines
- **APIs**: Asegúrate de que las APIs funcionen correctamente
- **Límites**: Respeta los términos de servicio de WhatsApp

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ve el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola para errores
2. Verifica tu configuración en `config.js`
3. Asegúrate de tener Node.js actualizado
4. Contacta al desarrollador

---

¡Disfruta usando tu bot de WhatsApp! 🎉