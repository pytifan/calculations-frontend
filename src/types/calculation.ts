export type FluidType =
  | 'drilling_mud'
  | 'cement'
  | 'completion_fluid'
  | 'spacer_fluid'
  | 'displacement_fluid'

export type SolverMethod = 'hybr' | 'lm' | 'broyden1'
export type UnitSystem = 'metric' | 'imperial'

export interface CalculationOptions {
  solverMethod: SolverMethod
  maxIterations: number
  tolerance: number
  unitSystem: UnitSystem
}

export interface WellConfig {
  wellName: string
  fieldName: string
  depthMeters: number
  diameterInches: number
  fluidType: FluidType
}

export interface CalculationRequest {
  equations: string[]
  initialParameters: number[]
  options: CalculationOptions
  wellConfig?: WellConfig
}

export interface CalculationResponse {
  calculationId: string
  status: string
  message: string
  sseStreamUrl: string
  estimatedTimeSeconds: number
}

export interface ProgressEvent {
  type: 'progress'
  calculationId: string
  percentage: number
  phase: string
  iteration: number
  convergenceMetric: number
  message: string
  currentFluidType: FluidType | null
}

export interface VolumeRequirement {
  fluidType: FluidType
  volumeM3: number
  volumeBbl: number
  volumeGal: number
  calculationBasis?: string
  description?: string
}

export interface CalculationMetadata {
  algorithmUsed: string
  iterations: number
  finalConvergence: number
  elapsedMs: number
  converged: boolean
  unitSystem: string
}

export interface ResultEvent {
  type: 'result'
  calculationId: string
  volumes: VolumeRequirement[]
  metadata: CalculationMetadata
}

export interface ErrorEvent {
  type: 'error'
  calculationId: string
  errorCode: string
  errorMessage: string
  suggestion?: string
}

export type SSEEvent = ProgressEvent | ResultEvent | ErrorEvent

export type CalcStatus = 'idle' | 'submitting' | 'streaming' | 'done' | 'error'

export interface ServiceInfo {
  service: string
  apiVersion: string
  description: string
  supportedFluids: string[]
  unitSystems: string[]
  solverMethods: string[]
  endpoints: {
    restApi: string
    websocket: string
    progressStream: string
    documentation: string
  }
  limits: {
    maxConcurrentCalculations: number
    calculationTimeoutSeconds: number
    maxEquationsPerRequest: number
  }
}
