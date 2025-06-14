interface CommandResult {
  success: boolean;
  output?: string[];
  error?: string;
}

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  requiredAccess: 'root' | 'executor' | 'guest';
  aliases?: string[];
  execute: (args: string[], flags: Record<string, any>, user: User) => Promise<CommandResult>;
}

export const commands: Command[] = [
  {
    name: 'help',
    description: 'Display available mystical commands',
    usage: 'help [command]',
    requiredAccess: 'guest',
    aliases: ['?'],
    execute: async (args) => {
      if (args.length > 0) {
        const cmd = commands.find(c => c.name === args[0]);
        if (cmd) {
          return {
            success: true,
            output: [
              `┌─ ${cmd.name.toUpperCase()} ─`,
              `│ Description: ${cmd.description}`,
              `│ Usage: ${cmd.usage}`,
              `│ Required Access: ${cmd.requiredAccess.toUpperCase()}`,
              `└─────────────────────────────────────`
            ]
          };
        }
        return { success: false, error: `Command '${args[0]}' not found in mystical archives` };
      }
      
      return {
        success: true,
        output: [
          '╔═══════════════ MYSTICAL COMMANDS ═══════════════╗',
          '║                                                 ║',
          '║  Core System Commands:                          ║',
          '║    help               - Show this help          ║',
          '║    status            - System status            ║',
          '║    whoami            - Current user info        ║',
          '║                                                 ║',
          '║  Transformation Commands:                       ║',
          '║    initiate.transfiguration  - Transform target ║',
          '║    execute.draconic_morpher  - Dragon morphing  ║',
          '║                                                 ║',
          '║  Chamber Commands:                              ║',
          '║    synchronize.prism_nodes   - Sync chambers    ║',
          '║    access.chamber           - Enter chamber     ║',
          '║                                                 ║',
          '║  Duel Commands:                                 ║',
          '║    launch.reflection_duel   - Start mirror duel ║',
          '║                                                 ║',
          '║  Memory Commands:                               ║',
          '║    access.memory.core       - Access memories   ║',
          '║    scan.temporal_echoes     - Scan time echoes  ║',
          '║                                                 ║',
          '║  Security Commands (ROOT):                      ║',
          '║    lockdown.bastion_wide    - Emergency lockdown║',
          '║    shutdown.ossuary_spindle - Shutdown systems  ║',
          '║                                                 ║',
          '╚═════════════════════════════════════════════════╝',
          '',
          'Use "help <command>" for detailed documentation.',
          'Use "man <command>" for technical specifications.'
        ]
      };
    }
  },

  {
    name: 'status',
    description: 'Display current system status',
    usage: 'status [--detailed]',
    requiredAccess: 'guest',
    execute: async (args, flags) => {
      const detailed = flags.detailed || flags.d;
      
      const baseStatus = [
        '═══ SYSTEM STATUS ═══',
        '🔮 Bastion Core: ONLINE',
        '⚡ Aether Flow: 87% (Optimal)',
        '🛡️  Ward Integrity: 76% (Warning)',
        '💎 Prism Alignment: 95% (Optimal)',
        '🌀 Void Containment: 42% (Critical)',
        ''
      ];

      if (detailed) {
        return {
          success: true,
          output: [
            ...baseStatus,
            '═══ DETAILED ANALYSIS ═══',
            '📊 Chamber Activity:',
            '   • Prism Atrium: 12 active transformations',
            '   • Metamorphic Conclave: 3 morphing rituals',
            '   • Ember Ring: Synchronization in progress',
            '   • Void Nexus: Containment breach detected',
            '',
            '🔄 Recent Operations:',
            '   • Memory synchronization: COMPLETED',
            '   • Ward recalibration: IN PROGRESS',
            '   • Temporal scan: QUEUED',
            '',
            '⚠️  Critical Alerts:',
            '   • Void containment at 42% - Immediate attention required',
            '   • Ward fluctuations in Sector 3',
            '   • Prism Node 7 showing resonance drift'
          ]
        };
      }

      return { success: true, output: baseStatus };
    }
  },

  {
    name: 'whoami',
    description: 'Display current user information',
    usage: 'whoami',
    requiredAccess: 'guest',
    execute: async (args, flags, user) => {
      return {
        success: true,
        output: [
          '═══ DIMENSIONAL IDENTITY ═══',
          `👤 User: ${user.username}`,
          `🔑 Access Level: ${user.accessLevel.toUpperCase()}`,
          `🌟 Authentication: VERIFIED`,
          `⏰ Session Active: ${new Date().toLocaleString()}`,
          '',
          `🎭 Mystical Abilities:`,
          user.accessLevel === 'root' ? '   • Full bastion control' :
          user.accessLevel === 'executor' ? '   • Chamber operations, ritual execution' :
          '   • Basic viewing and system queries'
        ]
      };
    }
  },

  {
    name: 'initiate.transfiguration',
    description: 'Begin transformation ritual on specified target',
    usage: 'initiate.transfiguration --target=<subject> --form=<transformation>',
    requiredAccess: 'executor',
    execute: async (args, flags) => {
      if (!flags.target || !flags.form) {
        return {
          success: false,
          error: 'RITUAL FAULT: Missing required parameters --target and --form'
        };
      }

      const target = flags.target;
      const form = flags.form;

      return {
        success: true,
        output: [
          '🔮 TRANSFIGURATION RITUAL INITIATED',
          '═══════════════════════════════════',
          `📍 Target: ${target}`,
          `🎭 Desired Form: ${form}`,
          '',
          '⚡ Channeling mystical energies...',
          '🌟 Prism nodes aligning...',
          '💫 Transformation matrix stabilizing...',
          '',
          `✨ RITUAL COMPLETE: ${target} successfully transformed into ${form}`,
          '🔄 Metabolic systems adapting...',
          '🧬 Genetic template updated...',
          '',
          '✅ Transfiguration successful. Subject vitals stable.'
        ]
      };
    }
  },

  {
    name: 'execute.draconic_morpher',
    description: 'Activate draconic transformation protocols',
    usage: 'execute.draconic_morpher --target=<subject> [--scale-color=<color>]',
    requiredAccess: 'executor',
    execute: async (args, flags) => {
      if (!flags.target) {
        return {
          success: false,
          error: 'MORPHER FAULT: Target designation required'
        };
      }

      const target = flags.target;
      const scaleColor = flags['scale-color'] || 'Obsidian';

      return {
        success: true,
        output: [
          '🐉 DRACONIC MORPHER ACTIVATED',
          '════════════════════════════════',
          `🎯 Target: ${target}`,
          `🎨 Scale Pattern: ${scaleColor}`,
          '',
          '🔥 Dragon essence infusion beginning...',
          '⚡ Bone structure reinforcement: 25%... 50%... 75%... COMPLETE',
          '🛡️  Scale generation initiated...',
          '👁️  Enhanced sensory systems online...',
          '🌬️  Breath weapon calibration...',
          '',
          `🐲 TRANSFORMATION COMPLETE: ${target} now manifests as ${scaleColor} Dragon`,
          '💪 Physical enhancement: +300% strength, +500% durability',
          '🔥 Breath weapon: Activated',
          '👑 Draconic wisdom: Unlocked',
          '',
          '✅ Subject successfully ascended to draconic form.'
        ]
      };
    }
  },

  {
    name: 'synchronize.prism_nodes',
    description: 'Synchronize mystical prism nodes in specified chamber',
    usage: 'synchronize.prism_nodes --chamber=<chamber_name>',
    requiredAccess: 'executor',
    execute: async (args, flags) => {
      if (!flags.chamber) {
        return {
          success: false,
          error: 'SYNC FAULT: Chamber designation required'
        };
      }

      const chamber = flags.chamber.replace(/_/g, ' ');

      return {
        success: true,
        output: [
          '💎 PRISM NODE SYNCHRONIZATION',
          '═══════════════════════════════',
          `🏛️  Chamber: ${chamber}`,
          '',
          '🔍 Scanning prism configuration...',
          '⚡ Node 1: Frequency 432.7 Hz - ALIGNED',
          '⚡ Node 2: Frequency 528.0 Hz - ALIGNED',
          '⚡ Node 3: Frequency 741.3 Hz - ALIGNING...',
          '⚡ Node 4: Frequency 963.1 Hz - ALIGNED',
          '',
          '🌟 Harmonic resonance achieved',
          '💫 Dimensional stability: OPTIMAL',
          '🔮 Mystical conductivity: 98.7%',
          '',
          `✅ All prism nodes in ${chamber} synchronized successfully.`,
          '🎭 Chamber ready for advanced operations.'
        ]
      };
    }
  },

  {
    name: 'launch.reflection_duel',
    description: 'Initiate mirror-entity combat simulation',
    usage: 'launch.reflection_duel --target=<opponent> --mirror_entity=<entity>',
    requiredAccess: 'executor',
    execute: async (args, flags) => {
      if (!flags.target || !flags.mirror_entity) {
        return {
          success: false,
          error: 'DUEL FAULT: Both --target and --mirror_entity required'
        };
      }

      const target = flags.target;
      const mirror = flags.mirror_entity;

      return {
        success: true,
        output: [
          '⚔️  REFLECTION DUEL INITIATED',
          '══════════════════════════════',
          `🥊 Combatant: ${target}`,
          `🪞 Mirror Entity: ${mirror}`,
          '',
          '🌀 Dimensional arena manifesting...',
          '✨ Mirror realm accessing...',
          '⚡ Combat parameters calibrated...',
          '',
          '🥋 DUEL COMMENCING:',
          `   • ${target} enters combat stance`,
          `   • ${mirror} materializes from mirror dimension`,
          '   • Mystical barriers erected',
          '   • Temporal loop stabilized',
          '',
          '💥 Combat sequence initiated...',
          '🔥 Energy blasts exchanged!',
          '🛡️  Defensive maneuvers activated!',
          '⚡ Power levels fluctuating!',
          '',
          `🏆 DUEL RESULT: ${Math.random() > 0.5 ? target : mirror} emerges victorious!`,
          '🎭 Both combatants gain valuable experience.',
          '✅ Mirror realm safely closed.'
        ]
      };
    }
  },

  {
    name: 'access.memory.core',
    description: 'Access deep memory archives',
    usage: 'access.memory.core --subject=<entity> --layer=<memory_layer>',
    requiredAccess: 'executor',
    execute: async (args, flags) => {
      if (!flags.subject) {
        return {
          success: false,
          error: 'MEMORY FAULT: Subject designation required'
        };
      }

      const subject = flags.subject;
      const layer = flags.layer || 'surface';

      return {
        success: true,
        output: [
          '🧠 MEMORY CORE ACCESS',
          '══════════════════════',
          `👤 Subject: ${subject}`,
          `🔍 Layer: ${layer}`,
          '',
          '🌀 Establishing neural link...',
          '💫 Memory matrices scanning...',
          '🔮 Temporal echoes detected...',
          '',
          '📜 MEMORY FRAGMENTS:',
          subject === 'Valtharix' ? [
            '   • Origin: Forged in the Primal Void',
            '   • First Mirror: The Shattered Realm incident',
            '   • Bastion Creation: Year 2,847 of the Third Age',
            '   • Greatest Victory: The Celestial Convergence',
            '   • Deepest Regret: The Lost Reflection of Seraphina'
          ] : [
            `   • Birth Echo: Dimensional coordinates unknown`,
            `   • Core Identity: ${subject} consciousness pattern`,
            `   • Key Memories: [ENCRYPTED - Higher access required]`,
            `   • Emotional Resonance: Complex harmonic patterns`,
            `   • Last Backup: Recent synchronization detected`
          ],
          '',
          layer === 'emergent_origin' ? '🌟 ORIGIN LAYER ACCESSED: Primal creation memories unlocked' : '⚠️  Surface layer only - use --layer=emergent_origin for deeper access',
          '',
          '✅ Memory access complete. Neural link terminated safely.'
        ].flat()
      };
    }
  },

  {
    name: 'access.chamber',
    description: 'Enter specified mystical chamber',
    usage: 'access.chamber <chamber_name>',
    requiredAccess: 'guest',
    execute: async (args) => {
      if (args.length === 0) {
        return {
          success: false,
          error: 'CHAMBER FAULT: Chamber designation required'
        };
      }

      const chamber = args.join(' ').replace(/_/g, ' ');
      const chambers = {
        'prism atrium': 'A vast crystalline hall where light bends reality itself',
        'metamorphic conclave': 'The transformation chamber where forms are fluid',
        'ember ring': 'Circle of eternal flames that never consume',
        'void nexus': 'Where the space between spaces can be touched',
        'memory sanctum': 'Repository of all consciousness and experience',
        'mirror maze': 'Infinite reflections hiding infinite truths'
      };

      const description = chambers[chamber.toLowerCase()] || 'A mysterious chamber of unknown purpose';

      return {
        success: true,
        output: [
          '🚪 CHAMBER ACCESS GRANTED',
          '═══════════════════════════',
          `🏛️  Entering: ${chamber.toUpperCase()}`,
          '',
          '🌀 Dimensional gateway opening...',
          '✨ Reality anchors stabilizing...',
          '🔮 Environmental harmonics calibrated...',
          '',
          `📍 LOCATION: ${description}`,
          '',
          '🎭 Current chamber status:',
          '   • Atmospheric pressure: Optimal',
          '   • Mystical resonance: 94.2%',
          '   • Dimensional stability: Locked',
          '   • Available operations: ACTIVE',
          '',
          `✅ Successfully entered ${chamber}`,
          '💡 Use "chamber.scan" to detect available interactions.'
        ]
      };
    }
  },

  {
    name: 'scan.temporal_echoes',
    description: 'Scan for temporal disturbances and echoes',
    usage: 'scan.temporal_echoes [--range=<distance>]',
    requiredAccess: 'executor',
    execute: async (args, flags) => {
      const range = flags.range || 'local';

      return {
        success: true,
        output: [
          '⏰ TEMPORAL ECHO SCAN',
          '═══════════════════════',
          `🔍 Scan Range: ${range}`,
          '',
          '🌀 Chronometer calibration...',
          '⚡ Temporal sensors active...',
          '💫 Echo patterns analyzing...',
          '',
          '📊 TEMPORAL ANOMALIES DETECTED:',
          '   • Time Rift (Minor): Sector 7 - Age: 3.7 hours',
          '   • Echo Cascade: Memory Sanctum - Intensity: Moderate',
          '   • Temporal Loop: Duel Arena - Status: Contained',
          '   • Chrono Distortion: Void Nexus - Risk: HIGH',
          '',
          '🔮 ECHO ANALYSIS:',
          '   • Past Echoes: 847 fragments detected',
          '   • Future Resonance: 23 probability chains',
          '   • Parallel Dimensions: 5 interference patterns',
          '',
          '⚠️  WARNING: Chrono distortion in Void Nexus requires immediate attention',
          '✅ Temporal scan complete. Data archived to memory core.'
        ]
      };
    }
  },

  {
    name: 'lockdown.bastion_wide',
    description: 'Initiate emergency bastion-wide security lockdown',
    usage: 'lockdown.bastion_wide [--except=<authorized_areas>]',
    requiredAccess: 'root',
    execute: async (args, flags) => {
      const exceptions = flags.except ? flags.except.split(',') : [];

      return {
        success: true,
        output: [
          '🚨 EMERGENCY LOCKDOWN INITIATED',
          '═══════════════════════════════════',
          '⚠️  BASTION-WIDE SECURITY PROTOCOL ACTIVE',
          '',
          '🔒 Sealing all dimensional gateways...',
          '🛡️  Activating maximum ward strength...',
          '⚡ Redirecting all power to defenses...',
          '🌀 Stabilizing temporal anchors...',
          '',
          '📍 LOCKDOWN STATUS:',
          '   • All chambers: SEALED',
          '   • External portals: CLOSED',
          '   • Emergency systems: ACTIVE',
          '   • Defense grid: MAXIMUM POWER',
          '',
          exceptions.length > 0 ? `🔓 EXCEPTIONS MAINTAINED:` : '🔒 NO EXCEPTIONS - TOTAL LOCKDOWN',
          ...exceptions.map(area => `   • ${area}: ACCESSIBLE`),
          '',
          '🚨 LOCKDOWN COMPLETE',
          '⏰ Estimated duration: Until manual override',
          '🎯 Use "lockdown.disable" with proper authorization to lift restrictions.'
        ]
      };
    }
  },

  {
    name: 'shutdown.ossuary_spindle',
    description: 'Shutdown the mystical ossuary spindle system',
    usage: 'shutdown.ossuary_spindle [--force]',
    requiredAccess: 'root',
    execute: async (args, flags) => {
      const force = flags.force;

      if (!force) {
        return {
          success: false,
          error: 'SAFETY FAULT: Ossuary spindle shutdown requires --force flag. This action cannot be undone.'
        };
      }

      return {
        success: true,
        output: [
          '💀 OSSUARY SPINDLE SHUTDOWN',
          '═══════════════════════════════',
          '⚠️  CRITICAL SYSTEM TERMINATION',
          '',
          '🌀 Spindle rotation decreasing...',
          '💀 Soul anchor points releasing...',
          '⚡ Necrotic energy dissipating...',
          '🕳️  Void channels closing...',
          '',
          '📊 SHUTDOWN PROGRESS:',
          '   • Spindle RPM: 10,000... 5,000... 1,000... 0',
          '   • Soul containers: EVACUATED',
          '   • Death essence: NEUTRALIZED',
          '   • Dimensional rifts: SEALED',
          '',
          '💀 OSSUARY SPINDLE: OFFLINE',
          '⚠️  Soul processing capabilities disabled',
          '🔒 Necrotic chambers sealed indefinitely',
          '',
          '✅ Shutdown complete. The realm of death sleeps once more.',
          '⚡ Massive energy reserves now available for other systems.'
        ]
      };
    }
  },

  {
    name: 'man',
    description: 'Display detailed manual pages for commands',
    usage: 'man <command>',
    requiredAccess: 'guest',
    execute: async (args) => {
      if (args.length === 0) {
        return {
          success: false,
          error: 'MANUAL FAULT: Command name required. Usage: man <command>'
        };
      }

      const commandName = args[0];
      const command = commands.find(cmd => cmd.name === commandName);

      if (!command) {
        return {
          success: false,
          error: `Manual entry for '${commandName}' not found in mystical archives`
        };
      }

      return {
        success: true,
        output: [
          `╔═══════════════════════════════════════════════════════════════╗`,
          `║                      MYSTICAL MANUAL                          ║`,
          `║                    ${command.name.toUpperCase().padStart(15)}${' '.repeat(28)}║`,
          `╚═══════════════════════════════════════════════════════════════╝`,
          '',
          'NAME',
          `     ${command.name} - ${command.description}`,
          '',
          'SYNOPSIS',
          `     ${command.usage}`,
          '',
          'ACCESS LEVEL',
          `     ${command.requiredAccess.toUpperCase()} or higher`,
          '',
          'DESCRIPTION',
          `     ${command.description}`,
          '',
          command.aliases ? 'ALIASES' : '',
          command.aliases ? `     ${command.aliases.join(', ')}` : '',
          command.aliases ? '' : '',
          'EXAMPLES',
          `     ${command.usage}`,
          '',
          'MYSTICAL NOTES',
          '     All commands channel the arcane energies of the Eternum Bastion.',
          '     Improper usage may result in dimensional disturbances.',
          '',
          'SEE ALSO',
          '     help(1), status(1), mystical-operations(7)'
        ].filter(line => line !== '')
      };
    }
  }
];

export default commands;