import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, '../plugins')

export async function loadPlugins(plugins) {
  try {
    if (!await fs.pathExists(pluginsDir)) {
      await fs.ensureDir(pluginsDir)
    }

    const files = await fs.readdir(pluginsDir)
    const jsFiles = files.filter(file => file.endsWith('.js'))

    for (const file of jsFiles) {
      try {
        const pluginPath = path.join(pluginsDir, file)
        const plugin = await import(`file://${pluginPath}`)
        
        if (plugin.default && plugin.default.command) {
          plugins.set(plugin.default.command, plugin.default)
          console.log(chalk.green(`✓ Plugin cargado: ${plugin.default.command}`))
        }
      } catch (error) {
        console.log(chalk.red(`✗ Error cargando ${file}:`, error.message))
      }
    }
  } catch (error) {
    console.log(chalk.red('Error cargando plugins:', error.message))
  }
}

export async function executeCommand(sock, msg, command, args, plugins) {
  const plugin = plugins.get(command)
  
  if (plugin) {
    await plugin.execute(sock, msg, args)
  }
}