import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { todosApi } from '@/lib/api'
import type { Todo } from '@/types/todo'

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
    todosApi.list().then((list) => {
      setTodos(list)
      setLoaded(true)
    })
  }, [])

  async function addTodo(text: string, tag?: string) {
    const todo = await todosApi.create(text, tag)
    setTodos((prev) => [...prev, todo])
  }

  async function toggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const next = await todosApi.setDone(id, !todo.done)
    setTodos((prev) => prev.map((t) => (t.id === id ? next : t)))
  }

  async function removeTodo(id: string) {
    await todosApi.remove(id)
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
