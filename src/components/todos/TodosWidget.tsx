import { useState } from 'react'
import clsx from 'clsx'
import { useTodos } from '@/state/TodosContext'
import { TODO_TAG_OPTIONS } from '@/data/todoTags'

export function TodosWidget() {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<string>('')

  function submit() {
    const text = draft.trim()
    if (text) addTodo(text, tag || undefined)
    setDraft('')
  }

  return (
    <div className="rounded-2xl border border-line bg-white/60 p-5 dark:border-dusk-line-dark dark:bg-white/5">
      <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
        Clear the mind
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {todos.map((todo) => (
          <li key={todo.id} className="group flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
              className="h-4 w-4 rounded border-line accent-sage-ink"
            />
            <span
              className={clsx(
                'flex-1 text-sm text-ink dark:text-inherit',
                todo.done && 'text-ink-soft line-through',
              )}
            >
              {todo.text}
            </span>
            {todo.tag && (
              <span className="rounded-full bg-cream-soft px-2 py-0.5 text-[11px] text-ink-soft dark:bg-white/10">
                {todo.tag}
              </span>
            )}
            <button
              type="button"
              onClick={() => removeTodo(todo.id)}
              aria-label="Remove todo"
              className="text-ink-soft/50 opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="+ Add something to hold"
          className="flex-1 rounded-xl border border-line bg-transparent px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-sage-deep dark:border-dusk-line-dark dark:text-inherit"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-xl border border-line bg-transparent px-2 py-1.5 text-xs text-ink-soft outline-none dark:border-dusk-line-dark"
        >
          <option value="">tag</option>
          {TODO_TAG_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
