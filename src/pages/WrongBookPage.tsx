import { useState } from 'react'
import { Link } from 'react-router-dom'
import { words } from '../data/words'
import { setWrongBook } from '../db/database'
import { useData } from '../state/AppContext'

export function WrongBookPage() {
  const { progress, refresh } = useData(); const [error, setError] = useState('')
  const items = words.filter(w => progress.get(w.id)?.inWrongBook).sort((a, b) => (progress.get(b.id)?.wrongCount || 0) - (progress.get(a.id)?.wrongCount || 0))
  async function remove(id: number) { try { await setWrongBook(id, false); await refresh() } catch { setError('移出失败，请重试') } }
  return <div className="page"><header className="page-header"><Link to="/">‹ 返回首页</Link><h1>错题本</h1><p>共 {items.length} 个单词，按错误次数排序。</p></header>{items.length > 0 && <Link className="primary full" to="/wrong/practice">开始错题练习</Link>}{error && <p className="error">{error}</p>}<div className="list">{items.length ? items.map(word => { const row = progress.get(word.id)!; return <div className="wrong-card" key={word.id}><div className="card-title"><h2>{word.word}</h2><button onClick={() => void remove(word.id)}>移出错题本</button></div><p>{word.meaning}</p><div className="metadata"><span>错误 {row.wrongCount} 次</span><span>正确 {row.correctCount} 次</span><span>最近错误 {row.lastWrongAt?.slice(0, 10) || '—'}</span></div></div> }) : <div className="empty card">还没有错题。答错的单词会自动出现在这里。</div>}</div></div>
}
