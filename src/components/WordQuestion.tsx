import type { Question, Word } from '../types'
import { WordDetail } from './Common'

export function AnswerOption({ label, meaning, state, disabled, onClick }: { label: string; meaning: string; state: 'correct' | 'wrong' | ''; disabled: boolean; onClick: () => void }) { return <button className={`answer-option ${state}`} disabled={disabled} onClick={onClick}><span className="answer-letter">{label}</span><span>{meaning}</span></button> }

export function WordQuestion({ word, question, selected, onAnswer, busy }: { word: Word; question: Question; selected?: number; onAnswer: (index: number) => void; busy?: boolean }) {
  const answered = selected !== undefined
  return <>
    <div className="question-word"><span className="eyebrow">选择正确释义</span><h1>{word.word}</h1>{word.phonetic && <p>{word.phonetic}</p>}</div>
    <div className="options">{question.options.map((meaning, index) => <AnswerOption key={`${index}-${meaning}`} label={'ABCD'[index]} meaning={meaning} disabled={answered || !!busy} state={answered ? index === question.correctIndex ? 'correct' : index === selected ? 'wrong' : '' : ''} onClick={() => onAnswer(index)} />)}</div>
    {answered && <div className={`feedback ${selected === question.correctIndex ? 'success' : 'failure'}`}><strong>{selected === question.correctIndex ? '✓ 回答正确' : '✕ 回答错误'}</strong>{selected !== question.correctIndex && <p>你的答案：{'ABCD'[selected]}　正确答案：{'ABCD'[question.correctIndex]}</p>}<WordDetail word={word} /></div>}
  </>
}
