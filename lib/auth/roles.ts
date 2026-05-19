import { UserRole } from '@prisma/client'

export { UserRole }

// Hierarquia de permissões
const ROLE_WEIGHT: Record<UserRole, number> = {
  ADMIN: 3,
  OPERADOR: 2,
  VISUALIZADOR: 1,
}

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[required]
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN
}

export function canWrite(role: UserRole) {
  return hasRole(role, UserRole.OPERADOR)
}

// Labels em português para UI
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
  VISUALIZADOR: 'Visualizador',
}
