export interface Todo {
  id: string
  text: string
  done: boolean
  tag?: string
  createdAt: number
  completedAt?: number
}
