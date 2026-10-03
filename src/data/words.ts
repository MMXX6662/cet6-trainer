import source from './cet6_words.json'
import type { Word } from '../types'

export const words: Word[] = (source as Word[]).filter(w => w.id > 0 && w.word && w.meaning)
export const wordById = new Map(words.map(w => [w.id, w]))

if (wordById.size !== words.length) throw new Error('词库中的 id 必须唯一')
