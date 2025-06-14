import { commands } from '../utils/commands';
import { checkPermission } from '../utils/permissions';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface CommandResult {
  success: boolean;
  output?: string[];
  error?: string;
}

class CommandProcessor {
  private user: User;
  private commandHistory: string[] = [];
  private macros: Record<string, string[]> = {};

  constructor(user: User) {
    this.user = user;
    this.loadMacros();
  }

  private loadMacros() {
    // Load saved macros from localStorage
    const savedMacros = localStorage.getItem('eternum_macros');
    if (savedMacros) {
      try {
        this.macros = JSON.parse(savedMacros);
      } catch (error) {
        console.error('Failed to load macros:', error);
      }
    }
  }

  private saveMacros() {
    localStorage.setItem('eternum_macros', JSON.stringify(this.macros));
  }

  async execute(input: string): Promise<CommandResult> {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { success: false, error: 'VOID COMMAND: No mystical invocation detected' };
    }

    // Add to command history
    this.commandHistory.push(trimmedInput);
    if (this.commandHistory.length > 100) {
      this.commandHistory = this.commandHistory.slice(-100);
    }

    // Check for macro execution
    if (trimmedInput.startsWith('macro.')) {
      return this.executeMacro(trimmedInput);
    }

    // Check for macro definition
    if (trimmedInput.startsWith('define.macro')) {
      return this.defineMacro(trimmedInput);
    }

    // Parse command and arguments
    const parts = this.parseCommand(trimmedInput);
    const commandName = parts.command;
    const args = parts.args;
    const flags = parts.flags;

    // Handle built-in meta commands
    if (commandName === 'history') {
      return this.showHistory(args, flags);
    }

    if (commandName === 'clear') {
      return { success: true, output: ['\x1b[2J\x1b[H'] }; // ANSI clear screen
    }

    if (commandName === 'macros') {
      return this.listMacros();
    }

    // Find command
    const command = commands.find(cmd => 
      cmd.name === commandName || cmd.aliases?.includes(commandName)
    );

    if (!command) {
      // Check for partial matches and suggest
      const suggestions = this.getSuggestions(commandName);
      if (suggestions.length > 0) {
        return {
          success: false,
          error: `RUNE FAULT: Unknown invocation '${commandName}'. Did you mean: ${suggestions.slice(0, 3).join(', ')}?`
        };
      }
      
      return {
        success: false,
        error: `RUNE FAULT: Unknown invocation '${commandName}'. Type 'help' for available commands.`
      };
    }

    // Check permissions
    if (!checkPermission(this.user.accessLevel, command.requiredAccess)) {
      return {
        success: false,
        error: `ACCESS DENIED: Insufficient mystical authority. Required: ${command.requiredAccess.toUpperCase()}`
      };
    }

    // Execute command
    try {
      const result = await command.execute(args, flags, this.user);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `CRITICAL FAULT: ${error instanceof Error ? error.message : 'Unknown system anomaly'}`
      };
    }
  }

  private parseCommand(input: string) {
    const parts = input.split(/\s+/);
    const command = parts[0];
    const remaining = parts.slice(1);
    
    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 0; i < remaining.length; i++) {
      const part = remaining[i];
      
      if (part.startsWith('--')) {
        // Long flag
        const [key, value] = part.substring(2).split('=');
        flags[key] = value || true;
      } else if (part.startsWith('-')) {
        // Short flag
        const key = part.substring(1);
        flags[key] = true;
      } else {
        // Argument
        args.push(part);
      }
    }

    return { command, args, flags };
  }

  private showHistory(args: string[], flags: Record<string, any>): CommandResult {
    const limit = parseInt(flags.limit) || 10;
    const recent = this.commandHistory.slice(-limit);
    
    return {
      success: true,
      output: [
        '📜 COMMAND HISTORY',
        '═════════════════',
        '',
        ...recent.map((cmd, index) => `${(this.commandHistory.length - limit + index + 1).toString().padStart(3)}: ${cmd}`),
        '',
        `Showing last ${recent.length} commands. Use --limit=<n> for more.`
      ]
    };
  }

  private defineMacro(input: string): CommandResult {
    const parts = input.split(' ');
    if (parts.length < 3) {
      return {
        success: false,
        error: 'MACRO FAULT: Usage: define.macro <name> <command1> [command2] ...'
      };
    }

    const macroName = parts[1];
    const commands = parts.slice(2);

    this.macros[macroName] = commands;
    this.saveMacros();

    return {
      success: true,
      output: [
        '🔮 MACRO DEFINED',
        '═══════════════',
        `📝 Name: ${macroName}`,
        `⚡ Commands: ${commands.length}`,
        '',
        'Commands:',
        ...commands.map((cmd, index) => `  ${index + 1}. ${cmd}`),
        '',
        `✅ Macro '${macroName}' saved successfully.`,
        `💡 Execute with: macro.${macroName}`
      ]
    };
  }

  private async executeMacro(input: string): Promise<CommandResult> {
    const macroName = input.substring(6); // Remove 'macro.'
    
    if (!this.macros[macroName]) {
      return {
        success: false,
        error: `MACRO FAULT: Macro '${macroName}' not found. Use 'macros' to list available macros.`
      };
    }

    const commands = this.macros[macroName];
    const results: string[] = [
      `🔮 EXECUTING MACRO: ${macroName}`,
      '═══════════════════════════════',
      ''
    ];

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      results.push(`⚡ Executing: ${command}`);
      
      try {
        const result = await this.execute(command);
        if (result.success && result.output) {
          results.push(...result.output.map(line => `   ${line}`));
        } else if (!result.success) {
          results.push(`   ❌ Error: ${result.error}`);
        }
      } catch (error) {
        results.push(`   ❌ Critical Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      results.push('');
    }

    results.push(`✅ Macro '${macroName}' execution complete.`);

    return {
      success: true,
      output: results
    };
  }

  private listMacros(): CommandResult {
    const macroNames = Object.keys(this.macros);
    
    if (macroNames.length === 0) {
      return {
        success: true,
        output: [
          '🔮 MACRO REGISTRY',
          '════════════════',
          '',
          'No macros defined.',
          '',
          '💡 Create macros with: define.macro <name> <command1> [command2] ...',
          '⚡ Execute macros with: macro.<name>'
        ]
      };
    }

    const output = [
      '🔮 MACRO REGISTRY',
      '════════════════',
      ''
    ];

    macroNames.forEach(name => {
      const commands = this.macros[name];
      output.push(`📝 ${name} (${commands.length} commands)`);
      commands.forEach((cmd, index) => {
        output.push(`   ${index + 1}. ${cmd}`);
      });
      output.push('');
    });

    output.push('💡 Execute with: macro.<name>');

    return {
      success: true,
      output
    };
  }

  getSuggestions(partial: string): string[] {
    const availableCommands = commands
      .filter(cmd => checkPermission(this.user.accessLevel, cmd.requiredAccess))
      .map(cmd => cmd.name);
    
    // Add meta commands
    availableCommands.push('history', 'clear', 'macros');
    
    // Add macro commands
    Object.keys(this.macros).forEach(macro => {
      availableCommands.push(`macro.${macro}`);
    });

    return availableCommands
      .filter(cmd => cmd.toLowerCase().includes(partial.toLowerCase()))
      .slice(0, 5);
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  getMacros(): Record<string, string[]> {
    return { ...this.macros };
  }
}

export default CommandProcessor;