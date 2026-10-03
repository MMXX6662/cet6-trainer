import type { Question, Word } from '../types'

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function makeQuestion(word: Word, words: Word[]): Question {
  const distractors = shuffle([...new Set(words.filter(w => w.id !== word.id).map(w => w.meaning).filter(m => m !== word.meaning))]).slice(0, 3)
  if (distractors.length < 3) throw new Error('词库至少需要四种不同释义')
  const options = shuffle([word.meaning, ...distractors])
  return { wordId: word.id, options, correctIndex: options.indexOf(word.meaning) }
}

export function makeExam(words: Word[]): Question[] {
  if (words.length < 100) throw new Error('100 词考试需要至少 100 个不同单词')
  return shuffle(words).slice(0, 100).map(w => makeQuestion(w, words))
}
