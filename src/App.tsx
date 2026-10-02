import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNavigation } from './components/Common'
import { AppProvider, useData } from './state/AppContext'
import { HomePage } from './pages/HomePage'
import { StudyPage } from './pages/StudyPage'
import { ExamStartPage, ExamResultPage } from './pages/ExamPages'
import { WrongBookPage } from './pages/WrongBookPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { SettingsPage } from './pages/SettingsPage'

function Content() {
  const { loading, error } = useData(); const { pathname } = useLocation()
  if (loading) return <div className="loading">正在读取学习记录…</div>
  if (error) return <div className="loading error">无法使用本地数据库：{error}</div>
  return <><main className={pathname === '/study' || pathname === '/exam' || pathname === '/wrong/practice' ? 'main main-practice' : 'main'}><Routes><Route path="/" element={<HomePage/>}/><Route path="/study" element={<StudyPage mode="all"/>}/><Route path="/exam/start" element={<ExamStartPage/>}/><Route path="/exam" element={<StudyPage mode="exam"/>}/><Route path="/exam/result" element={<ExamResultPage/>}/><Route path="/wrong" element={<WrongBookPage/>}/><Route path="/wrong/practice" element={<StudyPage mode="wrong"/>}/><Route path="/stats" element={<StatisticsPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<HomePage/>}/></Routes></main>{!['/study','/exam','/wrong/practice'].includes(pathname) && <BottomNavigation/>}</>
}
export default function App() { return <HashRouter><AppProvider><Content/></AppProvider></HashRouter> }
