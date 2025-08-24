export default {
  command: 'calc',
  category: 'Utilidades',
  description: 'Calculadora matemática básica',
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid
    
    if (args.length === 0) {
      await sock.sendMessage(jid, {
        text: '❌ Por favor proporciona una operación matemática.\n\n*Ejemplos:*\ncalc 2+2\ncalc 10*5\ncalc 100/4\ncalc 15-3'
      })
      return
    }
    
    const expression = args.join('')
    
    try {
      // Validar que solo contenga números y operadores básicos
      if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
        throw new Error('Expresión inválida')
      }
      
      // Evaluar la expresión de forma segura
      const result = Function(`"use strict"; return (${expression})`)()
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Resultado inválido')
      }
      
      const calcText = `🧮 *CALCULADORA*\n\n`
        + `📝 *Operación:* ${expression}\n`
        + `✅ *Resultado:* ${result}\n\n`
        + `> Cálculo realizado exitosamente`
      
      await sock.sendMessage(jid, { text: calcText })
      
    } catch (error) {
      await sock.sendMessage(jid, {
        text: '❌ Error en la operación matemática. Verifica que la expresión sea válida.\n\n*Operadores permitidos:* + - * / ( )'
      })
    }
  }
}