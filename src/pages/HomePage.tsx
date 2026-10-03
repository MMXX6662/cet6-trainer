import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../state/AppContext'
import { words } from '../data/words'
import { ProgressBar, StatCard } from '../components/Common'
import { getActiveExam } from '../db/database'

export function HomePage() {
  const { progress, appState } = useData(); const navigate = useNavigate()
  const rows = [...progress.values()]; const learned = rows.filter(p => p.learned).length
  const correct = rows.reduce((n, p) => n + p.correctCount, 0), wrong = rows.reduce((n, p) => n + p.wrongCount, 0)
  const today = new Date().toLocaleDateString('en-CA')
  const todayCount = rows.filter(p => p.lastAnsweredAt && new Date(p.lastAnsweredAt).toLocaleDateString('en-CA') === today).length
  async function enterExam() { const session = await getActiveExam(); navigate(session ? '/exam' : '/exam/start') }
  return <div className="page home"><header className="hero"><div className="hero-top"><span className="eyebrow">每天一点，稳步积累</span><Link to="/settings" className="header-link">设置</Link></div><h1>CET-6<br/>刷词宝典</h1><p>今天也来认识几个新单词吧。</p></header>
    <section className="overview card"><div className="section-heading"><h2>学习总览</h2><span>{Math.round(learned / Math.max(words.length, 1) * 100)}%</span></div><p>已学习 <b>{learned}</b> / {words.length}</p><ProgressBar value={learned} total={words.length}/><div className="stat-grid"><StatCard label="未学习" value={words.length - learned}/><StatCard label="今日学习" value={todayCount}/><StatCard label="错题数量" value={rows.filter(p => p.inWrongBook).length}/><StatCard label="总正确率" value={`${correct + wrong ? Math.round(correct / (correct + wrong) * 100) : 0}%`}/></div></section>
    <section className="home-actions"><h2>开始学习</h2><Link className="action action-primary" to="/study"><span><b>全部词汇</b><small>按顺序练习 · 共 {words.length} 词</small></span><span>›</span></Link><button className="action" onClick={() => void enterExam()} disabled={words.length < 100}><span><b>100 词考试</b><small>{words.length < 100 ? '词库需至少 100 词' : '随机抽题 · 即时判题'}</small></span><span>›</span></button><Link className="action" to="/wrong"><span><b>错题本</b><small>复习曾经答错的词</small></span><span>›</span></Link><Link className="action" to="/stats"><span><b>学习统计</b><small>查看进度与考试历史</small></span><span>›</span></Link></section>
    <Link className="continue-card" to={`/study?index=${Math.min(appState.lastStudyIndex, Math.max(0, words.length - 1))}`}><span><b>继续上次学习</b><small>第 {Math.min(appState.lastStudyIndex + 1, words.length)} / {words.length} 词</small></span><span>继续 ›</span></Link>
    <p className="footnote">学习记录保存在此设备的浏览器中。</p></div>
}
