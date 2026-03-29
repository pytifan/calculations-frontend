export type FluidType =
  | 'drilling_mud'
  | 'cement'
  | 'completion_fluid'
  | 'spacer_fluid'
  | 'displacement_fluid'

export type UnitSystem = 'metric' | 'imperial'

export interface CalculationOptions {
  unitSystem: UnitSystem
}

export interface WellConfig {
  wellName: string
  fieldName: string
  depthMeters: number
  diameterInches: number
  fluidType: FluidType
}

export interface WellParameters {
  tubingLengthM: number           // tubing length [m]
  tubingOdMm: number              // tubing outer diameter [mm]
  tubingWallMm: number            // tubing wall thickness [mm]
  casingOdMm: number              // casing outer diameter [mm]
  casingWallMm: number            // casing wall thickness [mm]
  fluidDensityKgM3: number        // completion fluid density [kg/m³]
  gravityMpS2: number             // gravitational acceleration [m/s²]
  initialWaterLevelM: number      // initial fluid surface depth [m]
  surfacePressurePa: number       // surface injection pressure [Pa]
  maxWellheadPressurePa: number   // max wellhead back-pressure [Pa]
  minWellheadPressurePa: number   // min wellhead back-pressure [Pa]
}

export interface CalculationRequest {
  options: CalculationOptions
  wellConfig?: WellConfig
  wellParams?: WellParameters
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
  // Well completion visualization fields
  wellheadPressurePa: number
  bottomPressurePa: number
  volumePumpedM3: number
  annulusFrontM: number
  tubingFrontM: number
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
  endpoints: {
    restApi: string
    websocket: string
    progressStream: string
    documentation: string
  }
  limits: {
    maxConcurrentCalculations: number
    calculationTimeoutSeconds: number
  }
}
