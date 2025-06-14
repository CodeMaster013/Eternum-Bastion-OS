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

  constructor(user: User) {
    this.user = user;
  }

  async execute(input: string): Promise<CommandResult> {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { success: false, error: 'VOID COMMAND: No mystical invocation detected' };
    }

    // Parse command and arguments
    const parts = this.parseCommand(trimmedInput);
    const commandName = parts.command;
    const args = parts.args;
    const flags = parts.flags;

    // Find command
    const command = commands.find(cmd => 
      cmd.name === commandName || cmd.aliases?.includes(commandName)
    );

    if (!command) {
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

  getSuggestions(partial: string): string[] {
    const availableCommands = commands
      .filter(cmd => checkPermission(this.user.accessLevel, cmd.requiredAccess))
      .map(cmd => cmd.name);
    
    return availableCommands
      .filter(cmd => cmd.startsWith(partial))
      .slice(0, 5);
  }
}

export default CommandProcessor;