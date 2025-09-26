// --- Combined Imports ---
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import readline from 'readline';
import pkgPhone from 'google-libphonenumber';

// --- Original Imports for Plugin System ---
import config from './config.js';
import { loadPlugins } from './lib/pluginManager.js';
import { handleMessage } from './lib/messageHandler.js';
import ErrorHandler from './lib/errorHandler.js';

// --- Logger Setup ---
const logger = pino({ level: 'warn' });

// --- Original Globals for Plugin System ---
const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
let sock;
let errorHandler;
const plugins = new Map();

// --- New Main Connection Function ---
async function connectToWhatsApp() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Usando Baileys v${version.join('.')}, ¿es la última versión?: ${isLatest}`);

  // Phone number validation logic
  const PhoneNumberUtil = pkgPhone.PhoneNumberUtil;
  const phoneUtil = PhoneNumberUtil.getInstance();
  async function isValidPhoneNumber(number) {
    try {
      let n = number.replace(/\s+/g, '');
      if (n.startsWith('+521')) n = n.replace('+521', '+52');
      if (n.startsWith('+52') && n[3] === '1') n = '+52' + n.slice(4);
      const parsed = phoneUtil.parseAndKeepRawInput(n);
      return phoneUtil.isValidNumber(parsed);
    } catch { return false; }
  }

  // Interactive menu logic
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(res => rl.question(q, ans => res(ans.trim())));
  let option = null;
  let phoneNumber = null;

  if (!state.creds.registered) {
    const menuDesign = `${chalk.cyanBright('╭─────────────────────────────◉')}\n`
      + `${chalk.cyanBright('│')} ${chalk.red.bgBlueBright.bold('    ⚙ MÉTODO DE CONEXIÓN BOT    ')}\n`
      + `${chalk.cyanBright('│')} 「 🗯 」${chalk.yellow('Selecciona cómo quieres conectarte')}\n`
      + `${chalk.cyanBright('│')} 「 📲 」${chalk.yellow.bgRed.bold('1. Escanear Código QR')}\n`
      + `${chalk.cyanBright('│')} 「 🔛 」${chalk.red.bgGreenBright.bold('2. Código de Emparejamiento')}\n`
      + `${chalk.cyanBright('│')}\n`
      + `${chalk.cyanBright('╰─────────────────────────────◉')}\n`;
    do {
      option = await ask(menuDesign + chalk.green('Ingresa una opción (1-2): '));
      if (!/^[1-2]$/.test(option)) console.log(chalk.red('Ingresa 1 o 2.'));
    } while (!['1','2'].includes(option));

    if (option === '2') {
      let valid = false;
      while (!valid) {
        phoneNumber = await ask(chalk.green('Ingresa tu número con código de país (ej +57300xxxxxxx): '));
        phoneNumber = phoneNumber.replace(/\s+/g, '');
        if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber.replace(/[^\d]/g,'');
        valid = await isValidPhoneNumber(phoneNumber);
        if (!valid) console.log(chalk.red('Número inválido o formato no reconocido, intenta nuevamente.'));
      }
    }
    rl.close();
  } else {
    console.log(chalk.gray('[auth] Sesión existente. Omitiendo menú.'));
    option = '1';
  }

  const usingCode = option === '2';

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger,
    browser: usingCode ? Browsers.macOS('Safari') : ['MiBot', 'Chrome', '1.0.0'],
    printQRInTerminal: !usingCode,
  });

  errorHandler = new ErrorHandler(sock);

  if (usingCode && !sock.authState.creds.registered) {
    const digits = phoneNumber.replace(/\D/g, '');
    console.log(chalk.cyan(`[code] Solicitando código de emparejamiento para ${digits}...`));
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(digits);
        console.log(chalk.bold.white(chalk.bgMagenta('✧ CÓDIGO DE VINCULACIÓN ✧')), chalk.bold.white(code?.match(/.{1,4}/g)?.join('-') || code));
      } catch (e) {
        console.error(chalk.red('[code] Error al solicitar el código:'), e);
      }
    }, 3000);
  }

  // --- Event Handlers ---
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr && !usingCode) {
      console.log(chalk.yellow('Escanea el código QR con WhatsApp:'));
      qrcode.generate(qr, { small: true });
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('Conexión cerrada debido a'), lastDisconnect.error, chalk.yellow('Reconectando...'), shouldReconnect);
      
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log(chalk.green(`✓ Bot conectado como ${config.botName || sock.user.name}`));
      console.log(chalk.blue('Cargando plugins...'));
      await loadPlugins(plugins);
      console.log(chalk.cyan(`Plugins cargados: ${plugins.size}`));
      console.log(chalk.blue('Bot listo para recibir mensajes'));
    }
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      await handleMessage(sock, msg, plugins, errorHandler);
    } catch (error) {
      console.error(chalk.red('Error procesando mensaje:'), error.message);
      if (errorHandler) {
        await errorHandler.handleSystemError(error, 'Procesamiento de mensajes');
      }
    }
  });
}

// --- Original Process-wide Error Handlers ---
process.on('unhandledRejection', async (error) => {
  console.error(chalk.red('Promesa no manejada:'), error);
  if (errorHandler) {
    await errorHandler.handleSystemError(error, 'Promesa no manejada');
  }
});

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('Excepción no capturada:'), error);
  if (errorHandler) {
    await errorHandler.handleSystemError(error, 'Excepción no capturada');
  }
  process.exit(1);
});

// --- Start the Bot ---
connectToWhatsApp();

export { sock };