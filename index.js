// --- New Imports for Connection Logic ---
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys';
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

// --- Original Globals ---
const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
let sock;
let errorHandler;
const plugins = new Map();

/**
 * Main function to start the bot connection process.
 * This function now includes the logic to choose a connection method.
 */
async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(chalk.cyan(`[info] Usando Baileys v${version.join('.')}, ¿es la última versión?: ${isLatest}`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(res => rl.question(q, ans => res(ans.trim())));

  let option = null;
  let phoneNumber = null;

  // Show connection menu ONLY if no session is registered
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
    } while (!['1', '2'].includes(option));

    if (option === '2') {
      const PhoneNumberUtil = pkgPhone.PhoneNumberUtil.getInstance();
      let valid = false;
      while (!valid) {
        phoneNumber = await ask(chalk.green('Ingresa tu número con código de país (ej. +573001234567): '));
        try {
          valid = PhoneNumberUtil.isValidNumber(PhoneNumberUtil.parseAndKeepRawInput(phoneNumber));
        } catch { valid = false; }
        if (!valid) console.log(chalk.red('Número inválido. Inténtalo de nuevo.'));
      }
    }
    rl.close();
  } else {
    console.log(chalk.gray('[info] Sesión existente. Omitiendo menú.'));
  }

  const usingCode = option === '2';

  // The original try...catch block starts here
  try {
    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      logger: pino({ level: 'silent' }),
      browser: usingCode ? Browsers.macOS('Safari') : ['MiBot', 'Chrome', '1.0.0'],
    });

    // Request pairing code if needed
    if (usingCode && !sock.authState.creds.registered) {
      const digits = phoneNumber.replace(/\D/g, '');
      console.log(chalk.cyan(`[info] Solicitando código de emparejamiento para ${digits}...`));
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(digits);
          console.log(chalk.bold.white(chalk.bgMagenta('✧ CÓDIGO DE VINCULACIÓN ✧')), chalk.bold.white(code?.match(/.{1,4}/g)?.join('-') || code));
        } catch (e) {
          console.error(chalk.red('[error] No se pudo solicitar el código:'), e);
          startBot(); // Retry
        }
      }, 3000);
    }
    
    // Original event handlers are preserved
    errorHandler = new ErrorHandler(sock);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr && !usingCode) {
        console.log(chalk.yellow('Escanea el código QR con WhatsApp:'));
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error instanceof Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(chalk.red('Conexión cerrada, razón:'), lastDisconnect.error, chalk.yellow('Reconectando...'), shouldReconnect);

        if (shouldReconnect) {
          startBot();
        }
      } else if (connection === 'open') {
        console.log(chalk.green(`✓ Bot conectado como ${config.botName || sock.user.name}`));
        // Original plugin loading logic is preserved
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

        // Original message handling logic is preserved
        await handleMessage(sock, msg, plugins, errorHandler);
      } catch (error) {
        console.error(chalk.red('[error] Error procesando mensaje:'), error);
        if (errorHandler) {
          await errorHandler.handleSystemError(error, 'Procesamiento de mensajes');
        }
      }
    });

  } catch (error) {
    console.error(chalk.red('Error crítico iniciando bot:'), error);
    setTimeout(startBot, 10000);
  }
}

// Original process-wide error handlers are preserved
process.on('unhandledRejection', async (error) => {
  console.error(chalk.red('[error] Promesa no manejada:'), error);
  if (errorHandler) {
    await errorHandler.handleSystemError(error, 'Promesa no manejada');
  }
});

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('[error] Excepción no capturada:'), error);
  if (errorHandler) {
    await errorHandler.handleSystemError(error, 'Excepción no capturada');
  }
  process.exit(1);
});

// Original bot start call is preserved
startBot();

export { sock };