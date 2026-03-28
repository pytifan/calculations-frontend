export const FLUID_COLORS: Record<string, string> = {
  drilling_mud:       '#5D4037',
  cement:             '#9E9E9E',
  completion_fluid:   '#1565C0',
  spacer_fluid:       '#E65100',
  displacement_fluid: '#00695C',
}

export const FLUID_COLORS_LIGHT: Record<string, string> = {
  drilling_mud:       '#795548',
  cement:             '#BDBDBD',
  completion_fluid:   '#1976D2',
  spacer_fluid:       '#F4511E',
  displacement_fluid: '#00897B',
}

export const FLUID_LABELS: Record<string, string> = {
  drilling_mud:       'Drilling Mud',
  cement:             'Cement',
  completion_fluid:   'Completion Fluid',
  spacer_fluid:       'Spacer Fluid',
  displacement_fluid: 'Displacement Fluid',
}

export function getFluidColor(fluidType: string | null | undefined): string {
  if (!fluidType) return '#37474F'
  return FLUID_COLORS[fluidType] ?? '#37474F'
}

export function getFluidColorLight(fluidType: string | null | undefined): string {
  if (!fluidType) return '#455A64'
  return FLUID_COLORS_LIGHT[fluidType] ?? '#455A64'
}
