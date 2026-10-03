import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../components/Common'
import { clearAll } from '../db/database'
import { useData } from '../state/AppContext'

export function SettingsPage() {
  const [confirm, setConfirm] = useState(false), [error, setError] = useState(''); const { refresh } = useData(); const navigate = useNavigate()
  async function reset() { try { await clearAll(); await refresh(); navigate('/') } catch { setError('清除失败，请重试'); setConfirm(false) } }
  return <div className="page"><header className="page-header"><Link to="/">‹ 返回首页</Link><h1>设置</h1></header><section className="card"><h2>本地数据</h2><p className="muted">学习记录保存在当前设备的浏览器中。清除浏览器的网站数据也会删除这些记录。</p><button className="danger full" onClick={() => setConfirm(true)}>重置所有学习记录</button>{error && <p className="error">{error}</p>}</section>{confirm && <ConfirmDialog onCancel={() => setConfirm(false)} onConfirm={() => void reset()}/>}</div>
}
