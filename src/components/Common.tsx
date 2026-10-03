import { Link, useLocation } from 'react-router-dom'
import type { Word } from '../types'

export function ProgressBar({ value, total }: { value: number; total: number }) { return <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemax={total}><div style={{ width: `${total ? Math.min(100, value / total * 100) : 0}%` }} /></div> }
export function StatCard({ label, value }: { label: string; value: string | number }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div> }
export function BottomNavigation() {
  const { pathname } = useLocation()
  const links = [['/', '首页'], ['/study', '刷词'], ['/wrong', '错题'], ['/stats', '统计']] as const
  return <nav className="bottom-nav" aria-label="主导航">{links.map(([to, label]) => <Link key={to} className={pathname === to ? 'active' : ''} to={to}>{label}</Link>)}</nav>
}
export function WordDetail({ word }: { word: Word }) { return <section className="word-detail"><h3>{word.word}</h3>{word.phonetic && <p className="muted">{word.phonetic}</p>}<p><b>{word.partOfSpeech}</b> {word.meaning}</p>{word.example && <blockquote>{word.example}<small>{word.exampleTranslation}</small></blockquote>}</section> }
export function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) { return <div className="dialog-backdrop"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h3 id="reset-title">清除全部学习记录？</h3><p>错题、考试历史和学习进度都将删除，此操作无法恢复。</p><div className="dialog-actions"><button onClick={onCancel}>取消</button><button className="danger" onClick={onConfirm}>确认清除</button></div></div></div> }
