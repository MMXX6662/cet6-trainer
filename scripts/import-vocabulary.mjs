import { createReadStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'

// Download the two source files named below before running this one-off import.
const syllabusPath = process.argv[2] || 'cet_source.json'
const dictionaryPath = process.argv[3] || 'ecdict_source.csv'
const outputPath = 'src/data/cet6_words.json'

const syllabus = JSON.parse(readFileSync(syllabusPath, 'utf8')).四六级词汇词频排序表
if (!Array.isArray(syllabus) || syllabus.length !== 5278) throw new Error('Unexpected CET syllabus size')

const previous = JSON.parse(readFileSync(outputPath, 'utf8'))
const wanted = new Set([...syllabus.map(row => row.单词.toLowerCase()), ...previous.map(row => row.word.toLowerCase())])
const dictionary = new Map()

function parseCsvLine(line) {
  const fields = []
  let field = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { field += '"'; i++ }
      else quoted = !quoted
    } else if (char === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else field += char
  }
  fields.push(field)
  return fields
}

for await (const line of createInterface({ input: createReadStream(dictionaryPath, { encoding: 'utf8' }), crlfDelay: Infinity })) {
  const firstComma = line.indexOf(',')
  if (firstComma < 0 || !wanted.has(line.slice(0, firstComma).toLowerCase().replace(/^"|"$/g, ''))) continue
  const [word, phonetic, , translation] = parseCsvLine(line)
  if (!wanted.has(word.toLowerCase())) continue
  const firstDefinition = translation.split('\\n')[0].trim()
  const partOfSpeech = firstDefinition.match(/^(?:n|v|vt|vi|adj|adv|prep|conj|pron|art|num|int|aux|modal)\./i)?.[0] || ''
  const existing = dictionary.get(word)
  if (!existing || (!existing.phonetic && phonetic)) dictionary.set(word, { phonetic, partOfSpeech })
}

const result = [...previous]
const existingWords = new Set(result.map(row => row.word))
let nextId = Math.max(...result.map(row => row.id)) + 1
for (const row of [...syllabus.filter(row => row.六级 === '★'), ...syllabus.filter(row => row.六级 !== '★')]) {
  const word = row.单词.trim()
  if (existingWords.has(word)) continue
  const entry = dictionary.get(word) || dictionary.get(word.toLowerCase()) || {}
  result.push({
    id: nextId++, word,
    phonetic: entry.phonetic ? `[${entry.phonetic}]` : '',
    meaning: row.释义.trim(),
    partOfSpeech: entry.partOfSpeech || '',
    example: '', exampleTranslation: ''
  })
  existingWords.add(word)
}

if (new Set(result.map(row => row.id)).size !== result.length) throw new Error('Duplicate IDs')
if (new Set(result.map(row => row.word)).size !== result.length) throw new Error('Duplicate words')
if (syllabus.some(row => !existingWords.has(row.单词))) throw new Error('Missing syllabus word')
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify({ total: result.length, syllabus: syllabus.length, starred: syllabus.filter(row => row.六级 === '★').length, withPhonetic: result.filter(row => row.phonetic).length, withPartOfSpeech: result.filter(row => row.partOfSpeech).length }))
