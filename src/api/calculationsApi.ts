import type { CalculationRequest, CalculationResponse, ServiceInfo } from '../types/calculation'

export function getBaseUrl(): string {
  return (
    window.__ENV__?.VITE_API_URL ??
    import.meta.env.VITE_API_URL ??
    '/api/v1/calculations'
  )
}

export class ApiError extends Error {
  status: number
  detail?: string
  constructor(status: number, message: string, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    let detail: string | undefined
    try {
      const body = await res.json()
      message = body.title ?? body.message ?? message
      detail = body.detail
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message, detail)
  }
  return res.json() as Promise<T>
}

export async function fetchServiceInfo(): Promise<ServiceInfo> {
  const res = await fetch(`${getBaseUrl()}/info`)
  return handleResponse<ServiceInfo>(res)
}

export async function submitCalculation(req: CalculationRequest): Promise<CalculationResponse> {
  const res = await fetch(getBaseUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return handleResponse<CalculationResponse>(res)
}

export async function cancelCalculation(id: string): Promise<void> {
  await fetch(`${getBaseUrl()}/${id}`, { method: 'DELETE' })
}
