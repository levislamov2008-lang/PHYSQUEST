
import { useMemo, useState } from 'react'
import questions from './questions.json'
import './index.css'
import gymnastics from './assets/gymnastics.png'
import biatlon from './assets/biatlon.jpeg'
import luk from './assets/luk.jpg'
import pulevaya from './assets/pulevaya.jpeg'
import stand from './assets/stand.png'
import darts from './assets/dartz.jpg'

type Question = any

const letters = ['А', 'Б', 'В', 'Г', 'Д']

const targetImages = [
  { label: 'А', name: 'Стендовая стрельба', src: stand },
  { label: 'Б', name: 'Биатлон', src: biatlon },
  { label: 'В', name: 'Дартс', src: darts },
  { label: 'Г', name: 'Стрельба из лука', src: luk },
  { label: 'Д', name: 'Пулевая стрельба', src: pulevaya }
]

const typeLabels: Record<string, string> = {
  single: 'ВЫБОР ОТВЕТА',
  image: 'ВОПРОС ПО КАРТИНКЕ',
  text: 'ВВЕДИ ТЕРМИН',
  match: 'СООТВЕТСТВИЕ',
  order: 'ПОРЯДОК ДЕЙСТВИЙ',
  long: 'РАЗВЁРНУТЫЙ ОТВЕТ',
  textList: 'ВВЕДИ НЕ МЕНЕЕ ПЯТИ ПУНКТОВ',
  number: 'РАСЧЁТ'
}

const normalize = (s: string) =>
  s.toLocaleLowerCase('ru')
    .replaceAll('ё', 'е')
    .replace(/[.,!?;:]/g, '')
    .trim()

export default function App() {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [finished, setFinished] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [activeMatch, setActiveMatch] = useState<number | null>(null)
  const [activeChoiceRow, setActiveChoiceRow] = useState<number | null>(null)
  const [reviewIndex, setReviewIndex] = useState(0)

  const allQuestions = questions as Question[]
  const total = allQuestions.length
  const q = allQuestions[index]

  const answered = Object.keys(answers).length

  const score = useMemo(() => {
    return allQuestions.reduce((n: number, item: Question) => {
      const v = answers[item.id]

      if (v === undefined) return n

      if (item.type === 'single' || item.type === 'image') {
        return n + (v === item.a ? 1 : 0)
      }

      if (item.type === 'textList') {
        const typed = String(v ?? '').split(/\r?\n|;/).map((part: string) => normalize(part)).filter(Boolean)
        const matches = (item.answers ?? []).filter((answer: string) => typed.some((part: string) => part.includes(normalize(answer))))
        return n + (matches.length >= 5 ? 1 : 0)
      }

      if (item.type === 'text' || item.type === 'number') {
        return n + (
          normalize(String(v)) === normalize(String(item.a)) ? 1 : 0
        )
      }

      if (item.type === 'match' || item.type === 'order') {
        return n + (
          JSON.stringify(v) === JSON.stringify(item.a) ? 1 : 0
        )
      }

      return n
    }, 0)
  }, [answers, allQuestions])

  const setAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [q.id]: value
    }))
  }

  const current = q ? answers[q.id] : undefined

  const canContinue = (() => {
    if (current === undefined || current === '') return false

    if (q.type === 'match') {
      return Array.isArray(current) &&
        current.length === q.pairs.length &&
        current.every((v: string) => v !== '')
    }

    if (q.type === 'order') {
      return Array.isArray(current) && current.length > 0
    }

    if (q.type === 'textList') {
      const typed = String(current).split(/\r?\n|;/).map((part: string) => normalize(part)).filter(Boolean)
      const matches = (q.answers ?? []).filter((answer: string) => typed.some((part: string) => part.includes(normalize(answer))))
      return matches.length >= 5
    }
    if (q.type === 'long' || q.type === 'text' || q.type === 'number') {
      return String(current).trim().length > 0
    }

    return true
  })()

  const progress = finished
    ? 100
    : Math.round(((index + 1) / total) * 100)

  const goNext = () => {
    if (index === total - 1) {
      setFinished(true)
    } else {
      setIndex(index + 1)
    }
  }

  const restart = () => {
    setAnswers({})
    setIndex(0)
    setFinished(false)
    setReviewing(false)
    setStarted(false)
  }

  const reviewAnswers = () => {
    setReviewIndex(0)
    setReviewing(true)
    setFinished(false)
  }

  if (!started) {
    return (
      <main className="app-shell landing-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">P</div>
            <div className="brand-text">
              <b>PHYS<span>QUEST</span></b>
              <small>SPORTS KNOWLEDGE PLATFORM</small>
            </div>
          </div>

          <div className="version-tag">
            <span className="status-dot" />
            ONLINE TRAINING
          </div>
        </header>

        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              YOUR NEXT CHALLENGE
            </div>

            <h1>
              ТВОЯ СИЛА —
              <br />
              <span>ТВОИ ЗНАНИЯ.</span>
            </h1>

            <p className="hero-description">
              Проверь свои знания о спорте.
              Выполняй задания, зарабатывай XP
              и совершенствуй свой результат.
            </p>

            <div className="hero-stats">
              <div className="stat-card">
                <strong>{total}</strong>
                <span>ВОПРОСОВ</span>
              </div>

              <div className="stat-card">
                <strong>+XP</strong>
                <span>ЗА ОТВЕТЫ</span>
              </div>

              <div className="stat-card">
                <strong>01</strong>
                <span>ТРЕНИРОВКА</span>
              </div>
            </div>

            <button
              className="primary-button start-button"
              onClick={() => setStarted(true)}
            >
              НАЧАТЬ ТРЕНИРОВКУ
              <span className="button-arrow">↗</span>
            </button>

            <div className="hero-hint">
              <span>●</span> ГОТОВ К НОВОМУ ВЫЗОВУ?
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-circle">
              <div className="visual-inner">
                <span className="visual-number">01</span>
                <span className="visual-caption">PUSH YOUR LIMITS</span>
              </div>
            </div>

            <div className="visual-label label-top">
              <span>PHYSQUEST</span>
              <b>EST. 2026</b>
            </div>

            <div className="visual-label label-bottom">
              <b>MOVE</b>
              <b>THINK</b>
              <b>WIN<span>.</span></b>
            </div>

            <div className="visual-plus">+</div>
          </div>
        </section>

        <footer className="landing-footer">
          <span>PHYSQUEST © 2026</span>
          <span>TRAIN YOUR MIND. TRAIN YOUR BODY.</span>
        </footer>
      </main>
    )
  }

  if (reviewing) {
    const item = allQuestions[reviewIndex]
    const value = answers[item.id]
    const typedParts = String(value ?? '').split(/\r?\n|;/).map((part: string) => normalize(part)).filter(Boolean)
    const matchedList = item.type === 'textList' ? (item.answers ?? []).filter((answer: string) => typedParts.some((part: string) => part.includes(normalize(answer)))) : []
    const isCorrect = item.type === 'single' || item.type === 'image' ? value === item.a : item.type === 'text' || item.type === 'number' ? normalize(String(value ?? '')) === normalize(String(item.a ?? '')) : item.type === 'textList' ? matchedList.length >= 5 : item.type === 'match' || item.type === 'order' ? JSON.stringify(value) === JSON.stringify(item.a) : false
    const answerText = value === undefined || value === '' ? 'Ответ не дан' : item.type === 'single' || item.type === 'image' ? item.opts?.[value] ?? 'Ответ не распознан' : item.type === 'match' ? item.pairs.map((pair: string[], i: number) => `${pair[0]} — ${item.id === 28 ? value?.[i] ?? '—' : item.choices?.[Number(value?.[i])] ?? '—'}`).join('\\n') : item.type === 'order' ? (value as number[]).map((n, i) => `${i + 1}. ${item.items[n]}`).join('\\n') : String(value)
    const correctText = item.type === 'single' || item.type === 'image' ? item.opts?.[item.a] ?? '—' : item.type === 'text' || item.type === 'number' ? String(item.a ?? '—') : item.type === 'textList' ? (item.answers ?? []).map((answer: string) => `• ${answer}`).join('\\n') : item.type === 'match' ? item.pairs.map((pair: string[], i: number) => `${pair[0]} — ${item.id === 28 ? item.a[i] : item.choices?.[Number(item.a[i])]}`).join('\\n') : item.type === 'order' ? item.a.map((n: number, i: number) => `${i + 1}. ${item.items[n]}`).join('\\n') : '—'
    return (
      <main className="app-shell review-shell">
        <header className="topbar">
          <div className="brand"><div className="brand-icon">P</div><div className="brand-text"><b>PHYS<span>QUEST</span></b><small>РАЗБОР ОТВЕТОВ</small></div></div>
          <button className="secondary-button" onClick={() => { setReviewing(false); setFinished(true) }}>К РЕЗУЛЬТАТАМ</button>
        </header>
        <section className="review-content">
          <div className="eyebrow"><span className="eyebrow-line" />РАЗБОР ТРЕНИРОВКИ</div>
          <div className="review-progress-line"><span>ВОПРОС {String(reviewIndex + 1).padStart(2, '0')} / {total}</span><div><i style={{ width: `${((reviewIndex + 1) / total) * 100}%` }} /></div></div>
          <article className={`review-card ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
            <div className="review-card-head"><span>ВОПРОС {String(reviewIndex + 1).padStart(2, '0')}</span><b>{isCorrect ? 'ВЕРНО' : 'НЕВЕРНО'}</b></div>
            <h2>{item.q}</h2>
            <div className="review-answer-grid"><div><small>ТВОЙ ОТВЕТ</small><p>{answerText}</p></div><div><small>ПРАВИЛЬНЫЙ ОТВЕТ</small><p>{correctText}</p></div></div>
            {item.type === 'textList' && <p className="review-match-count">НАЙДЕНО ПРАВИЛЬНЫХ ПУНКТОВ: {matchedList.length} ИЗ 7 · ДЛЯ ЗАСЧЁТА НУЖНО 5</p>}
            {item.id === 28 && <div className="review-targets">{targetImages.map(target => <div key={target.label}><img src={target.src} alt={target.name}/><span>{target.label} · {target.name}</span></div>)}</div>}
          </article>
          <div className="review-navigation">
            <button className="secondary-button" disabled={reviewIndex === 0} onClick={() => setReviewIndex(i => Math.max(0, i - 1))}>← НАЗАД</button>
            <span>{reviewIndex + 1} / {total}</span>
            {reviewIndex === total - 1 ? <button className="primary-button" onClick={() => { setReviewing(false); setFinished(true) }}>К ИТОГАМ ↗</button> : <button className="primary-button" onClick={() => setReviewIndex(i => Math.min(total - 1, i + 1))}>СЛЕДУЮЩИЙ ↗</button>}
          </div>
        </section>
      </main>
    )
  }
  if (finished) {
    const percentage = Math.round((score / total) * 100)

    return (
      <main className="app-shell result-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">P</div>
            <div className="brand-text">
              <b>PHYS<span>QUEST</span></b>
              <small>TRAINING RESULTS</small>
            </div>
          </div>

          <div className="version-tag">
            <span className="status-dot" />
            SESSION COMPLETE
          </div>
        </header>

        <section className="result-content">
          <div className="result-icon">✓</div>

          <div className="eyebrow">
            <span className="eyebrow-line" />
            MISSION COMPLETE
          </div>

          <h1>
            ТРЕНИРОВКА
            <br />
            <span>ЗАВЕРШЕНА.</span>
          </h1>

          <p className="result-description">
            Ты прошёл все задания. Продолжай развиваться
            и улучшать свой результат!
          </p>

          <div className="result-dashboard">
            <div className="result-score">
              <span className="result-label">ТВОЙ РЕЗУЛЬТАТ</span>
              <div className="score-value">
                {score}<span>/{total}</span>
              </div>
              <div className="score-progress">
                <div style={{ width: `${percentage}%` }} />
              </div>
              <span className="score-percent">{percentage}% ПРАВИЛЬНЫХ ОТВЕТОВ</span>
            </div>

            <div className="result-extra">
              <div className="result-stat">
                <span>ОТВЕЧЕНО</span>
                <b>{answered}/{total}</b>
              </div>

              <div className="result-stat">
                <span>ПОЛУЧЕНО XP</span>
                <b className="green-text">+{score * 10}</b>
              </div>

              <div className="result-stat">
                <span>ТОЧНОСТЬ</span>
                <b>{percentage}%</b>
              </div>
            </div>
          </div>

          <div className="result-actions">
            <button className="primary-button" onClick={restart}>
              ПРОЙТИ ЕЩЁ РАЗ <span>↗</span>
            </button>

            <button className="secondary-button" onClick={reviewAnswers}>
              ПОСМОТРЕТЬ ОТВЕТЫ
            </button>
          </div>
        </section>

        <footer className="landing-footer">
          <span>PHYSQUEST © 2026</span>
          <span>KEEP MOVING FORWARD.</span>
        </footer>
      </main>
    )
  }

  return (
    <main className="app-shell quiz-shell">
      <header className="quiz-header">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div className="brand-text">
            <b>PHYS<span>QUEST</span></b>
            <small>SPORTS TRAINING</small>
          </div>
        </div>

        <div className="quiz-header-center">
          <span>ТВОЯ ТРЕНИРОВКА</span>
          <b>{String(index + 1).padStart(2, '0')} <i>/ {String(total).padStart(2, '0')}</i></b>
        </div>

        <div className="xp-counter">
          <span>⚡</span>
          {score * 10} XP
        </div>
      </header>

      <div className="main-progress">
        <div className="main-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <section className="quiz-content quiz-content-with-mascot">
        <div className={`phys-mascot-wrap ${current !== undefined ? 'mascot-active' : ''}`}>
          <div className="mascot-speech">{current !== undefined ? 'Отлично! Так держать!' : 'Вперёд! У тебя получится!'}</div>
          <svg className="phys-mascot" viewBox="0 0 240 340" role="img" aria-label="Спортивный персонаж PHYSQUEST">
            <ellipse cx="120" cy="326" rx="67" ry="10" fill="#000" opacity=".25"/>
            <path d="M92 245 L82 294 L105 302 L120 260 L137 302 L160 294 L148 244Z" fill="#d99a6c" stroke="#895b42" strokeWidth="3"/>
            <path d="M79 290 L108 296 L105 315 Q83 323 65 310Z M139 296 L166 286 L183 306 Q164 323 140 315Z" fill="#151c17"/>
            <path d="M63 307 Q86 317 108 309 L112 324 Q91 338 61 324Z M145 310 Q167 314 183 300 L198 317 Q179 337 146 326Z" fill="#eef1e9" stroke="#aab3a7" strokeWidth="2"/>
            <path d="M82 165 Q120 146 158 165 L168 253 Q121 275 72 253Z" fill="#222b24" stroke="#101510" strokeWidth="4"/>
            <path d="M89 170 Q120 158 151 171 L155 231 Q120 247 85 231Z" fill="#a8e83c" stroke="#5c8c21" strokeWidth="3"/>
            <path d="M101 181 L120 194 L139 181 L134 214 L120 225 L106 214Z" fill="#172019"/><text x="120" y="208" textAnchor="middle" fontSize="13" fontWeight="900" fill="#b6f542">PQ</text>
            <path d="M82 174 Q59 177 52 207 L39 242 Q36 257 49 262 Q60 265 67 248 L93 215Z M158 174 Q181 177 188 207 L201 242 Q204 257 191 262 Q180 265 173 248 L147 215Z" fill="#d99a6c" stroke="#895b42" strokeWidth="3"/>
            <path d="M37 240 Q25 232 19 244 Q14 256 28 266 L46 269 Q57 260 49 249Z M203 240 Q215 232 221 244 Q226 256 212 266 L194 269 Q183 260 191 249Z" fill="#d99a6c"/>
            <path d="M91 166 Q120 151 149 166 L155 181 Q120 195 85 181Z" fill="#172019"/>
            <path d="M91 91 Q88 48 120 43 Q158 43 164 88 L158 133 Q149 158 120 160 Q93 151 86 127Z" fill="#e9b184" stroke="#9c6546" strokeWidth="3"/>
            <path d="M85 103 Q70 63 100 35 Q130 11 159 36 Q180 56 164 105 L153 80 Q128 93 103 76 L96 111Z" fill="#242b26"/>
            <path d="M92 69 Q123 44 165 65 L171 81 Q134 72 98 91Z" fill="#b6f542"/>
            <path d="M101 113 Q110 105 118 113 M136 113 Q145 105 153 113" stroke="#382820" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <ellipse cx="110" cy="121" rx="5" ry="7" fill="#182019"/><ellipse cx="144" cy="121" rx="5" ry="7" fill="#182019"/>
            <path d="M123 124 L118 137 L127 139 M108 148 Q124 159 143 146" stroke="#89513c" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M88 112 Q78 130 91 147 M161 111 Q174 129 158 148" stroke="#9c6546" strokeWidth="3" fill="none"/>
          </svg>
          <span className="mascot-name">PULSE <i>· PHYSQUEST</i></span>
        </div>
        <div className="question-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              QUESTION {String(index + 1).padStart(2, '0')}
            </div>

            <span className="question-type">
              {typeLabels[q.type] || 'ВОПРОС'}
            </span>
          </div>

          <div className="question-number">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>

        <h1 className="question-title">{q.q}</h1>

        {q.type === 'image' && (
          <div className="image-question">
            <img src={gymnastics} alt="Гимнастическое упражнение" />
          </div>
        )}

        {(q.type === 'single' || q.type === 'image') && (
          <div className="options-grid">
            {q.opts.map((o: string, i: number) => (
              <button
                key={o}
                className={`option-card ${current === i ? 'selected' : ''}`}
                onClick={() => setAnswer(i)}
              >
                <span className="option-letter">{letters[i]}</span>
                <span className="option-text">{o}</span>
                <span className="option-check">
                  {current === i ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {(q.type === 'text' || q.type === 'number') && (
          <div className="input-section">
            <label>
              {q.type === 'number' ? 'ВВЕДИ ЧИСЛОВОЙ ОТВЕТ' : 'ТВОЙ ОТВЕТ'}
            </label>

            <input
              className="answer-input"
              placeholder={q.type === 'number' ? 'Например, 144' : 'Введи свой ответ...'}
              value={current ?? ''}
              onChange={e => setAnswer(e.target.value)}
            />
          </div>
        )}

        {q.type === 'match' && q.id === 28 && (
          <div className="target-match-wrap">
            <p className="input-hint">НАЖМИ НА ВИД СТРЕЛЬБЫ СЛЕВА, ЗАТЕМ НА НУЖНУЮ МИШЕНЬ СПРАВА. СВЯЗИ МОЖНО МЕНЯТЬ ДО ОТПРАВКИ.</p>
            <div className="target-match-board">
              <svg className="target-match-lines" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
                {(current ?? []).map((label: string, i: number) => {
                  const j = targetImages.findIndex(target => target.label === label)
                  return j < 0 ? null : <line key={`${i}-${label}`} x1="340" y1={50 + i * 100} x2="660" y2={50 + j * 100} />
                })}
              </svg>
              <div className="target-match-sources">{q.pairs.map((pair: string[], i: number) => <button key={i} className={`target-source ${activeMatch === i ? 'active' : ''} ${current?.[i] ? 'connected' : ''}`} onClick={() => setActiveMatch(i)}><span>{String(i + 1).padStart(2, '0')}</span><b>{pair[0]}</b><small>{current?.[i] ? `МИШЕНЬ ${current[i]}` : 'ВЫБРАТЬ'}</small></button>)}</div>
              <div className="target-match-choices">{targetImages.map(target => <button key={target.label} className={`target-choice ${activeMatch !== null && current?.[activeMatch] === target.label ? 'chosen' : ''} ${current?.includes(target.label) ? 'used' : ''}`} onClick={() => {
                if (activeMatch === null) return
                const next = [...(current ?? Array(q.pairs.length).fill(''))]
                const previous = next.findIndex((value: string) => value === target.label)
                if (previous !== -1 && previous !== activeMatch) next[previous] = ''
                next[activeMatch] = target.label
                setAnswer(next)
                setActiveMatch(null)
              }}><span className="target-label">{target.label}</span><img src={target.src} alt={target.name}/></button>)}</div>
            </div>
            <button className="reset-order" onClick={() => { setAnswer(Array(q.pairs.length).fill('')); setActiveMatch(null) }}>↻ СБРОСИТЬ СВЯЗИ</button>
          </div>
        )}

        {q.type === 'match' && q.id !== 28 && (
          <div className="match-list">
            <p className="input-hint">ВЫБЕРИ ПОДХОДЯЩИЙ ВАРИАНТ ДЛЯ КАЖДОЙ СТРОКИ</p>
            {q.pairs.map((pair: string[], i: number) => {
              const selectedValue = current?.[i] ?? ''
              const selectedLabel = selectedValue === '' ? '' : (q.choices ?? letters)[Number(selectedValue)]
              return (
                <div className="match-row game-match-row" key={i}>
                  <div className="match-name">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <b>{pair[0]}</b>
                  </div>
                  <div className="match-picker">
                    <button
                      type="button"
                      className={`match-picker-trigger ${selectedValue !== '' ? 'has-value' : ''} ${activeChoiceRow === i ? 'is-open' : ''}`}
                      aria-expanded={activeChoiceRow === i}
                      onClick={() => setActiveChoiceRow(activeChoiceRow === i ? null : i)}
                    >
                      <span>{selectedLabel || 'Выбрать ответ'}</span>
                      <span className="picker-chevron">{activeChoiceRow === i ? '−' : '+'}</span>
                    </button>
                    {activeChoiceRow === i && (
                      <div className="match-picker-menu">
                        {(q.choices ?? letters).map((choice: string, j: number) => (
                          <button
                            type="button"
                            key={j}
                            className={`match-picker-option ${selectedValue === String(j) ? 'chosen' : ''}`}
                            onClick={() => {
                              const next = [...(current ?? Array(q.pairs.length).fill(''))]
                              next[i] = String(j)
                              setAnswer(next)
                              setActiveChoiceRow(null)
                            }}
                          >
                            <span className="picker-option-letter">{letters[j] ?? String(j + 1)}</span>
                            <span>{choice}</span>
                            {selectedValue === String(j) && <b>✓</b>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {q.type === 'order' && (
          <div className="order-list">
            <p className="input-hint">
              ВЫБИРАЙ ДЕЙСТВИЯ В ПРАВИЛЬНОЙ ПОСЛЕДОВАТЕЛЬНОСТИ
            </p>

            {q.items.map((item: string, i: number) => {
              const selected = (current ?? []).includes(i)

              return (
                <button
                  key={i}
                  className={`order-item ${selected ? 'selected' : ''}`}
                  onClick={() => {
                    setAnswer(
                      selected
                        ? current.filter((x: number) => x !== i)
                        : [...(current ?? []), i]
                    )
                  }}
                >
                  <span className="order-index">
                    {selected ? current.indexOf(i) + 1 : '+'}
                  </span>
                  <span>{item}</span>
                  <span className="order-status">
                    {selected ? '✓' : '＋'}
                  </span>
                </button>
              )
            })}

            <button className="reset-order" onClick={() => setAnswer([])}>
              ↻ СБРОСИТЬ ПОСЛЕДОВАТЕЛЬНОСТЬ
            </button>
          </div>
        )}

        {q.type === 'textList' && (
          <div className="input-section text-list-section">
            <label>ВВЕДИ НЕ МЕНЕЕ ПЯТИ ТРЕБОВАНИЙ</label>
            <textarea className="answer-input long-input" placeholder="Напиши каждый пункт с новой строки..." value={current ?? ''} onChange={e => setAnswer(e.target.value)} />
            <p className="input-hint">КАЖДЫЙ ПУНКТ — С НОВОЙ СТРОКИ. НУЖНО НЕ МЕНЕЕ 5 ПРАВИЛЬНЫХ ПУНКТОВ.</p>
          </div>
        )}

        {q.type === 'long' && (
          <div className="input-section">
            <label>ТВОЙ РАЗВЁРНУТЫЙ ОТВЕТ</label>

            <textarea
              className="answer-input long-input"
              placeholder="Напиши свой ответ..."
              value={current ?? ''}
              onChange={e => setAnswer(e.target.value)}
            />
            <p className="input-hint">
              РАЗВЁРНУТЫЙ ОТВЕТ СОХРАНИТСЯ ДЛЯ ПРОСМОТРА.
            </p>
          </div>
        )}
      </section>

      <footer className="quiz-footer">
        <button
          className="secondary-button back-button"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          ← НАЗАД
        </button>

        <div className="footer-progress">
          <span>ПРОГРЕСС</span>
          <b>{progress}%</b>
        </div>

        <button
          className="primary-button next-button"
          disabled={!canContinue}
          onClick={goNext}
        >
          {index === total - 1 ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
          <span>↗</span>
        </button>
      </footer>
    </main>
  )
}
