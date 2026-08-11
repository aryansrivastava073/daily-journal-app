import { getDb } from './db'
import type { Todo } from '@/types/todo'

export async function listTodos(): Promise<Todo[]> {
  const db = await getDb()
  return db.getAll('todos')
}

export async function putTodo(todo: Todo): Promise<void> {
  const db = await getDb()
  await db.put('todos', todo)
}

export async function deleteTodo(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('todos', id)
}
