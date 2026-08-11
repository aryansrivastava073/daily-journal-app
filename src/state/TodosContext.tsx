import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { listTodos, putTodo as dbPutTodo, deleteTodo as dbDeleteTodo } from '@/lib/db'
import type { Todo } from '@/types/todo'
import { uuid } from '@/lib/uuid'

interface TodosContextValue {
  todos: Todo[]
  loaded: boolean
  addTodo: (text: string, tag?: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  removeTodo: (id: string) => Promise<void>
}

const TodosContext = createContext<TodosContextValue | null>(null)

export function TodosProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    listTodos().then((list) => {
      setTodos(list)
      setLoaded(true)
    })
  }, [])

  async function addTodo(text: string, tag?: string) {
    const todo: Todo = { id: uuid(), text, done: false, tag, createdAt: Date.now() }
    await dbPutTodo(todo)
    setTodos((prev) => [...prev, todo])
  }

  async function toggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const next: Todo = {
      ...todo,
      done: !todo.done,
      completedAt: !todo.done ? Date.now() : undefined,
    }
    await dbPutTodo(next)
    setTodos((prev) => prev.map((t) => (t.id === id ? next : t)))
  }

  async function removeTodo(id: string) {
    await dbDeleteTodo(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <TodosContext.Provider value={{ todos, loaded, addTodo, toggleTodo, removeTodo }}>
      {children}
    </TodosContext.Provider>
  )
}

export function useTodos(): TodosContextValue {
  const ctx = useContext(TodosContext)
  if (!ctx) throw new Error('useTodos must be used within TodosProvider')
  return ctx
}
