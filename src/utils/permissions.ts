type AccessLevel = 'root' | 'executor' | 'guest';

const accessHierarchy: Record<AccessLevel, number> = {
  'guest': 1,
  'executor': 2,
  'root': 3
};

export function checkPermission(userLevel: AccessLevel, requiredLevel: AccessLevel): boolean {
  return accessHierarchy[userLevel] >= accessHierarchy[requiredLevel];
}

export function getAccessLevel(level: AccessLevel): string {
  switch (level) {
    case 'root':
      return 'Supreme Mystical Authority - Full bastion control';
    case 'executor':
      return 'Advanced Practitioner - Ritual and chamber operations';
    case 'guest':
      return 'Initiate Observer - Basic system queries only';
    default:
      return 'Unknown access level';
  }
}