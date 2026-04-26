// /frontend/src/features/road-incidents/constants/road-incidents.constants.ts

export const INCIDENT_TYPES = [
  'Tráfico Pesado',
  'Falla Mecánica',
  'Accidente',
  'Clima Adverso',
  'Cierre de Vía',
  'Otro',
];

export const INCIDENT_STATES = [
  { label: 'Normal', value: 'abierta', icon: 'alert-circle-outline', color: 'text-blue-500' },
  { label: 'Urgente', value: 'urgente', icon: 'shield-alert', color: 'text-red-500' },
  { label: 'Resuelta', value: 'resuelta', icon: 'check-circle-outline', color: 'text-green-500' },
] as const;
