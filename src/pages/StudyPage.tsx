import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { words, wordById } from '../data/words'
import { getActiveExam, saveAnswer, saveAppState, saveExam } from '../db/database'
import { useData } from '../state/AppContext'
import { makeQuestion } from '../utils/quiz'
import { ProgressBar } from '../components/Common'
import { WordQuestion } from '../components/WordQuestion'
import type { ExamSession, Question } from '../types'

export function StudyPage({ mode }: { mode: 'all' | 'wrong' | 'exam' }) {
  const { progress, appState, refresh } = useData(); const navigate = useNavigate(); const location = useLocation(); const [search] = useSearchParams()
  const ids = useMemo(() => mode === 'wrong' ? words.filter(w => progress.get(w.id)?.inWrongBook).map(w => w.id) : words.map(w => w.id), [mode, progress])
  const [session, setSession] = useState<ExamSession>(); const [index, setIndex] = useState(() => Number(search.get('index') ?? (mode === 'all' ? appState.lastStudyIndex : 0)) || 0)
  const [question, setQuestion] = useState<Question>(); const [selected, setSelected] = useState<number>(); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  useEffect(() => { if (mode === 'exam') void getActiveExam().then(s => { if (s) { setSession(s); setIndex(s.currentIndex) } else navigate('/exam/start', { replace: true }) }) }, [mode, navigate])
  const count = mode === 'exam' ? session?.questions.length || 0 : ids.length
  const safeIndex = Math.max(0, Math.min(index, Math.max(0, count - 1)))
  const wordId = mode === 'exam' ? session?.questions[safeIndex]?.wordId : ids[safeIndex]
  const word = wordId === undefined ? undefined : wordById.get(wordId)
  useEffect(() => {
    if (!word) return
    if (mode === 'exam') { setQuestion(session?.questions[safeIndex]); setSelected(session?.answers[safeIndex]?.choice) }
    else {
      const previous = progress.get(word.id)
      const saved = previous?.lastQuestion
      setQuestion(saved || makeQuestion(word, words))
      setSelected(saved && previous?.lastChoice ? saved.options.indexOf(previous.lastChoice) : undefined)
    }
  }, [wordId, mode, safeIndex, session?.id])
  async function move(next: number) {
    if (mode === 'exam' && session) {
      if (next >= count) { navigate('/exam/result'); return }
      const updated = { ...session, currentIndex: next }; await saveExam(updated); setSession(updated)
    } else if (mode === 'all') await saveAppState({ key: 'main', lastStudyIndex: next })
    setIndex(next); setQuestion(undefined); setSelected(undefined); await refresh()
  }
  async function answer(choice: number) {
    if (!word || !question || selected !== undefined || busy) return
    setBusy(true); setError('')
    try {
      await saveAnswer(word.id, choice === question.correctIndex, question.options[choice], question)
      if (mode === 'exam' && session) {
        const updated = { ...session, answers: { ...session.answers, [safeIndex]: { choice, answeredAt: new Date().toISOString() } } }
        await saveExam(updated); setSession(updated)
      } else if (mode === 'all') await saveAppState({ key: 'main', lastStudyIndex: Math.min(safeIndex + 1, words.length - 1) })
      setSelected(choice); await refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : '保存答案失败，请重试') }
    finally { setBusy(false) }
  }
  if (!count) return <div className="page"><Link to="/">‹ 返回首页</Link><div className="empty card">{mode === 'wrong' ? '错题本还是空的，先去刷几个词吧。' : '正在准备题目…'}</div></div>
  if (!word || !question) return <div className="page">正在准备题目…</div>
  const back = mode === 'wrong' ? '/wrong' : '/'; const title = mode === 'all' ? '全部词汇' : mode === 'wrong' ? '错题练习' : '100 词考试'
  return <div className="page practice-page"><header className="practice-header"><Link to={back}>‹ 返回</Link><b>{title}</b><span>{safeIndex + 1} / {count}</span></header><ProgressBar value={safeIndex + 1} total={count}/><WordQuestion key={`${location.pathname}-${word.id}-${question.options.join('|')}`} word={word} question={question} selected={selected} onAnswer={i => void answer(i)} busy={busy}/>{selected !== undefined && mode !== 'exam' && <button className="retry" onClick={() => { setQuestion(makeQuestion(word, words)); setSelected(undefined) }}>重新练习此词</button>}{error && <p className="error">{error}</p>}
    <div className="practice-footer"><button onClick={() => void move(safeIndex - 1)} disabled={safeIndex === 0}>上一题</button><button className="primary" onClick={() => void move(safeIndex + 1)} disabled={mode === 'exam' ? selected === undefined : safeIndex === count - 1}>{mode === 'exam' && safeIndex === count - 1 ? '查看成绩' : '下一题'}</button></div></div>
}
