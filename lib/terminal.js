import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class Terminal {
  async run(command) {
    try {
      const { stdout, stderr } = await execAsync(command)
      return stdout || stderr || ''
    } catch (error) {
      return error.message || 'Error ejecutando comando'
    }
  }
}