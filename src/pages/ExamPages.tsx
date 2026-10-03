import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { words, wordById } from '../data/words'
import { finishExam, getActiveExam, saveExam } from '../db/database'
import { useData } from '../state/AppContext'
import { makeExam } from '../utils/quiz'
import type { ExamHistory, ExamSession } from '../types'

export function ExamStartPage() {
  const navigate = useNavigate(); const [active, setActive] = useState(false); const [busy, setBusy] = useState(false)
  useEffect(() => { void getActiveExam().then(s => setActive(!!s)) }, [])
  async function start() {
    setBusy(true)
    try { const session: ExamSession = { id: 'active', createdAt: new Date().toISOString(), questions: makeExam(words), answers: {}, currentIndex: 0, finished: false }; await saveExam(session); navigate('/exam') }
    finally { setBusy(false) }
  }
  return <div className="page"><header className="page-header"><Link to="/">‹ 返回首页</Link><h1>100 词考试</h1></header><section className="card intro"><span className="intro-icon">✎</span><h2>准备好了吗？</h2><p>从词库中随机抽取 100 个不同单词。每题选择后立即显示答案，完成后保存成绩。</p><button className="primary full" onClick={() => void start()} disabled={busy || words.length < 100}>开始新考试</button>{active && <Link className="secondary full" to="/exam">继续未完成的考试</Link>}{words.length < 100 && <p>当前词库不足 100 词。</p>}</section></div>
}

export function ExamResultPage() {
  const { history, refresh } = useData(); const navigate = useNavigate(); const [result, setResult] = useState<ExamHistory>(); const [missing, setMissing] = useState(false); const finalizing = useRef(false)
  useEffect(() => { if (finalizing.current) return; finalizing.current = true; void (async () => {
    const session = await getActiveExam()
    if (!session) { setResult(history[0]); setMissing(!history.length); return }
    if (Object.keys(session.answers).length !== session.questions.length) { navigate('/exam', { replace: true }); return }
    const correct = session.questions.reduce((n, q, i) => n + Number(session.answers[i]?.choice === q.correctIndex), 0)
    const record: ExamHistory = { id: crypto.randomUUID(), date: new Date().toISOString(), total: session.questions.length, correct, wrong: session.questions.length - correct, accuracy: Math.round(correct / session.questions.length * 100), questions: session.questions, answers: session.answers }
    await finishExam(record); setResult(record); await refresh()
  })() }, [])
  if (missing) return <div className="page"><p>没有可查看的考试成绩。</p><Link to="/">返回首页</Link></div>
  if (!result) return <div className="page">正在整理成绩…</div>
  const wrongQuestions = result.questions.map((q, index) => ({ q, answer: result.answers[index] })).filter(({ q, answer }) => answer?.choice !== q.correctIndex)
  return <div className="page result-page"><header className="page-header"><Link to="/">‹ 返回首页</Link><h1>考试完成</h1></header><div className="score-card"><span>本次得分</span><strong>{result.correct}<small>分</small></strong><p>正确率 {result.accuracy}%</p></div><div className="result-stats"><span>✓ 正确 {result.correct}</span><span>✕ 错误 {result.wrong}</span></div><div className="result-actions"><Link className="primary" to="/exam/start">再考一次</Link><button className="secondary" onClick={() => document.getElementById('wrong-list')?.scrollIntoView({ behavior: 'smooth' })}>查看本次错题</button><Link className="secondary" to="/">返回首页</Link></div><section id="wrong-list"><h2>本次错题 · {wrongQuestions.length}</h2>{wrongQuestions.length ? wrongQuestions.map(({ q, answer }) => <div className="wrong-card" key={q.wordId}><b>{wordById.get(q.wordId)?.word}</b><p>你的答案：{q.options[answer.choice]}</p><p>正确答案：{q.options[q.correctIndex]}</p></div>) : <p className="empty">全部答对，太棒了！</p>}</section></div>
}
