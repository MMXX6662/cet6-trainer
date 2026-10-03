import { Link } from 'react-router-dom'
import { words } from '../data/words'
import { ProgressBar, StatCard } from '../components/Common'
import { useData } from '../state/AppContext'

export function StatisticsPage() {
  const { progress, history } = useData(); const rows = [...progress.values()]
  const learned = rows.filter(p => p.learned).length, correct = rows.reduce((n, p) => n + p.correctCount, 0), wrong = rows.reduce((n, p) => n + p.wrongCount, 0)
  const accuracy = correct + wrong ? Math.round(correct / (correct + wrong) * 100) : 0
  const examAverage = history.length ? Math.round(history.reduce((n, e) => n + e.accuracy, 0) / history.length) : 0
  return <div className="page"><header className="page-header"><Link to="/">‹ 返回首页</Link><h1>学习统计</h1><p>每一步进展都值得记录。</p></header><section className="card"><div className="section-heading"><h2>词汇进度</h2><span>{Math.round(learned / Math.max(words.length, 1) * 100)}%</span></div><ProgressBar value={learned} total={words.length}/><div className="stat-grid"><StatCard label="词库总数" value={words.length}/><StatCard label="已学习" value={learned}/><StatCard label="未学习" value={words.length - learned}/><StatCard label="错题数量" value={rows.filter(p => p.inWrongBook).length}/></div></section><section className="card"><h2>答题表现</h2><div className="stat-grid"><StatCard label="总答题次数" value={correct + wrong}/><StatCard label="正确次数" value={correct}/><StatCard label="错误次数" value={wrong}/><StatCard label="正确率" value={`${accuracy}%`}/></div></section><section className="card"><h2>考试记录</h2><div className="stat-grid"><StatCard label="考试次数" value={history.length}/><StatCard label="平均正确率" value={`${examAverage}%`}/></div>{history.length ? history.map(e => <div className="history-row" key={e.id}><span>{new Date(e.date).toLocaleDateString('zh-CN')}</span><b>{e.correct} / {e.total}</b><span>正确率 {e.accuracy}%</span></div>) : <p className="muted">还没有完成考试。</p>}</section></div>
}
