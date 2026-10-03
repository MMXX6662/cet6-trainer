import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getAll, getAppState } from '../db/database'
import type { AppState, ExamHistory, Progress } from '../types'

interface DataContextValue { loading: boolean; error: string; progress: Map<number, Progress>; appState: AppState; history: ExamHistory[]; refresh: () => Promise<void> }
const Context = createContext<DataContextValue | undefined>(undefined)
export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(new Map<number, Progress>())
  const [appState, setAppState] = useState<AppState>({ key: 'main', lastStudyIndex: 0 })
  const [history, setHistory] = useState<ExamHistory[]>([])
  const refresh = useCallback(async () => {
    try {
      const [rows, state, exams] = await Promise.all([getAll<Progress>('wordProgress'), getAppState(), getAll<ExamHistory>('examHistory')])
      setProgress(new Map(rows.map(row => [row.wordId, row])))
      setAppState(state)
      setHistory(exams.sort((a, b) => b.date.localeCompare(a.date)))
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '无法读取本地学习数据') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  return <Context.Provider value={{ loading, error, progress, appState, history, refresh }}>{children}</Context.Provider>
}
export function useData() { const data = useContext(Context); if (!data) throw new Error('AppProvider missing'); return data }
