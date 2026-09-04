export type CandyKind = 'letter' | 'curse' | 'plain'

export interface BasketPublic {
  slug: string
  name: string
  count: number
  shells: number[]
  is_open: boolean
  open_at: string | null
  is_owner: boolean
  server_time: string
}

export interface CurseCard {
  id: number
  text: string
  duration: string
}

export interface CandyOut {
  id: string
  shell: number
  kind: CandyKind
  content: string | null
  curse: CurseCard | null
  sender: string | null
  created_at: string
}

export interface OpenResponse {
  slug: string
  name: string
  is_open: boolean
  open_at: string | null
  server_time: string
  candies: CandyOut[]
}

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    let detail: unknown = null
    try {
      detail = (await res.json()).detail
    } catch {
      /* 본문 없음 */
    }
    const message =
      typeof detail === 'string'
        ? detail
        : detail && typeof detail === 'object' && 'message' in detail
          ? String((detail as { message: string }).message)
          : '잠깐 문제가 생겼어. 다시 해봐.'
    throw new ApiError(res.status, message, detail)
  }
  return (await res.json()) as T
}

export const api = {
  me: () => request<{ basket: BasketPublic | null }>('/api/me'),
  createBasket: (name: string) =>
    request<BasketPublic>('/api/baskets', { method: 'POST', body: JSON.stringify({ name }) }),
  basket: (slug: string) => request<BasketPublic>(`/api/baskets/${slug}`),
  curses: (slug: string) => request<CurseCard[]>(`/api/baskets/${slug}/curses`),
  throw: (slug: string, body: { shell: number; kind: CandyKind; content?: string; curse_id?: number; sender?: string }) =>
    request<{ count: number; shell: number }>(`/api/baskets/${slug}/candies`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  open: (slug: string) => request<OpenResponse>(`/api/baskets/${slug}/candies`),
}

export function shareUrl(slug: string) {
  return `${window.location.origin}/b/${slug}`
}
