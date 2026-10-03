import type { AppState, ExamHistory, ExamSession, Progress, Question } from '../types'

const NAME = 'CET6TrainerDB'
const VERSION = 1
type Store = 'wordProgress' | 'wrongBook' | 'examHistory' | 'appState' | 'examSession'
let connection: Promise<IDBDatabase> | undefined

function openDb(): Promise<IDBDatabase> {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('wordProgress')) db.createObjectStore('wordProgress', { keyPath: 'wordId' })
      if (!db.objectStoreNames.contains('wrongBook')) db.createObjectStore('wrongBook', { keyPath: 'wordId' })
      if (!db.objectStoreNames.contains('examHistory')) db.createObjectStore('examHistory', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('appState')) db.createObjectStore('appState', { keyPath: 'key' })
      if (!db.objectStoreNames.contains('examSession')) db.createObjectStore('examSession', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { connection = undefined; reject(request.error) }
  })
  return connection
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
}
function completed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error) })
}
export async function getAll<T>(store: Store): Promise<T[]> {
  const db = await openDb(); return requestValue(db.transaction(store).objectStore(store).getAll()) as Promise<T[]>
}
export async function getOne<T>(store: Store, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDb(); return requestValue(db.transaction(store).objectStore(store).get(key)) as Promise<T | undefined>
}
export async function put<T>(store: Store, value: T): Promise<void> {
  const db = await openDb(); const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).put(value); await completed(tx)
}
export async function remove(store: Store, key: IDBValidKey): Promise<void> {
  const db = await openDb(); const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).delete(key); await completed(tx)
}

// One transaction keeps the progress row and wrong book in sync.
export async function saveAnswer(wordId: number, correct: boolean, choiceMeaning: string, question: Question): Promise<Progress> {
  const db = await openDb()
  const tx = db.transaction(['wordProgress', 'wrongBook'], 'readwrite')
  const progressStore = tx.objectStore('wordProgress')
  const old = await requestValue<Progress | undefined>(progressStore.get(wordId))
  const now = new Date().toISOString()
  const next: Progress = {
    wordId, learned: true, correctCount: (old?.correctCount || 0) + Number(correct),
    wrongCount: (old?.wrongCount || 0) + Number(!correct), lastAnsweredAt: now,
    lastResult: correct ? 'correct' : 'wrong', inWrongBook: !correct || !!old?.inWrongBook,
    lastWrongAt: correct ? old?.lastWrongAt : now, lastChoice: choiceMeaning, lastQuestion: question
  }
  progressStore.put(next)
  if (next.inWrongBook) tx.objectStore('wrongBook').put({ wordId })
  await completed(tx)
  return next
}

export async function setWrongBook(wordId: number, included: boolean): Promise<Progress | undefined> {
  const db = await openDb(); const tx = db.transaction(['wordProgress', 'wrongBook'], 'readwrite')
  const store = tx.objectStore('wordProgress'); const record = await requestValue<Progress | undefined>(store.get(wordId))
  if (record) { record.inWrongBook = included; store.put(record); if (included) tx.objectStore('wrongBook').put({ wordId }); else tx.objectStore('wrongBook').delete(wordId) }
  await completed(tx); return record
}

export async function getAppState(): Promise<AppState> { return (await getOne<AppState>('appState', 'main')) || { key: 'main', lastStudyIndex: 0 } }
export async function saveAppState(state: AppState): Promise<void> { await put('appState', state) }
export async function getActiveExam(): Promise<ExamSession | undefined> { return getOne('examSession', 'active') }
export async function saveExam(session: ExamSession): Promise<void> { await put('examSession', session) }
export async function finishExam(history: ExamHistory): Promise<void> {
  const db = await openDb(); const tx = db.transaction(['examHistory', 'examSession'], 'readwrite')
  tx.objectStore('examHistory').put(history); tx.objectStore('examSession').delete('active'); await completed(tx)
}
export async function clearAll(): Promise<void> {
  const db = await openDb(); const names: Store[] = ['wordProgress', 'wrongBook', 'examHistory', 'appState', 'examSession']
  const tx = db.transaction(names, 'readwrite'); names.forEach(name => tx.objectStore(name).clear()); await completed(tx)
}
