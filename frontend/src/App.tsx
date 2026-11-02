
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
  multi: 'ВЫБЕРИ ПРАВИЛЬНЫЕ ВАРИАНТЫ',
  number: 'РАСЧЁТ'
}

const normalize = (s: string) =>
  s.toLocaleLowerCase('ru')
    .replaceAll('ё', 'е')
    .replace(/[.,!?;:]/g, '')
    .trim()

const textListKeywords = [
  ['проветрен', 'проветрива', 'свежем воздух', 'воздух', 'помещен'],
  ['10', '15', 'минут', 'длительност'],
  ['постепенн', 'нагрузк', 'прост', 'сложн'],
  ['основн', 'мышечн', 'мышц', 'групп'],
  ['вводн', 'основн', 'заключительн', 'част'],
  ['возрастн', 'особенност', 'учащ'],
  ['дыхани', 'дыхательн', 'дыш', 'контрол']
]
const getTextListMatches = (value: unknown) => {
  const lines = String(value ?? '').split(/\r?\n/).map(line => normalize(line).replace(/^\s*\d+[.)-]?\s*/, '')).filter(Boolean)
  return textListKeywords.filter((keywords, i) => {
    const line = lines[i] ?? ''
    if (!line) return false
    const hits = keywords.filter(keyword => line.includes(normalize(keyword))).length
    return hits >= (i === 0 || i === 1 ? 1 : 2)
  }).length
}

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

      if (item.type === 'multi') {
        return n + (Array.isArray(v) && v.length >= 5 && v.every((choice: number) => item.a.includes(choice)) ? 1 : 0)
      }
      if (item.type === 'textList') {
        return n + (getTextListMatches(v) >= 5 ? 1 : 0)
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

    if (q.type === 'multi') {
      return Array.isArray(current) && current.length >= 5
    }
    if (q.type === 'textList') {
      return getTextListMatches(current) >= 5
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
    const matchedList = item.type === 'textList' ? getTextListMatches(value) : 0
    const isCorrect = item.type === 'single' || item.type === 'image' ? value === item.a : item.type === 'text' || item.type === 'number' ? normalize(String(value ?? '')) === normalize(String(item.a ?? '')) : item.type === 'multi' ? Array.isArray(value) && value.length >= 5 && value.every((choice: number) => item.a.includes(choice)) : item.type === 'textList' ? matchedList >= 5 : item.type === 'match' || item.type === 'order' ? JSON.stringify(value) === JSON.stringify(item.a) : false
    const answerText = value === undefined || value === '' ? 'Ответ не дан' : item.type === 'single' || item.type === 'image' ? item.opts?.[value] ?? 'Ответ не распознан' : item.type === 'multi' ? (value as number[]).map((n) => item.opts[n]).join('\\n') : item.type === 'match' ? item.pairs.map((pair: string[], i: number) => `${pair[0]} — ${item.id === 28 ? value?.[i] ?? '—' : item.choices?.[Number(value?.[i])] ?? '—'}`).join('\\n') : item.type === 'order' ? (value as number[]).map((n, i) => `${i + 1}. ${item.items[n]}`).join('\\n') : String(value)
    const correctText = item.type === 'single' || item.type === 'image' ? item.opts?.[item.a] ?? '—' : item.type === 'multi' ? item.a.map((n: number) => item.opts[n]).join('\\n') : item.type === 'text' || item.type === 'number' ? String(item.a ?? '—') : item.type === 'textList' ? (item.answers ?? []).map((answer: string, i: number) => `${i + 1}. ${answer}`).join('\\n') : item.type === 'match' ? item.pairs.map((pair: string[], i: number) => `${pair[0]} — ${item.id === 28 ? item.a[i] : item.choices?.[Number(item.a[i])]}`).join('\\n') : item.type === 'order' ? item.a.map((n: number, i: number) => `${i + 1}. ${item.items[n]}`).join('\\n') : '—'
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
            {item.type === 'textList' && <p className="review-match-count">НАЙДЕНО ПРАВИЛЬНЫХ ПУНКТОВ: {matchedList} ИЗ 7 · ДЛЯ ЗАСЧЁТА НУЖНО 5</p>}
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

          <div className="result-celebration" role="status">
            <div className="celebration-glow" />
            <div className="celebration-confetti" aria-hidden="true">
              {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * -0.19}s`, rotate: `${i * 29}deg` }} />)}
            </div>
            <div className="result-mascot-stage">
              <div className="result-mascot-bubble">
                {percentage >= 90
                  ? 'ДААА! Вот это уровень! Ты настоящий чемпион!'
                  : percentage >= 70
                    ? 'Крутая работа! Ещё немного — и будет идеальный результат!'
                    : percentage >= 40
                      ? 'Ты справился! Тренируйся дальше — в следующий раз будет ещё круче!'
                      : 'Главное — не сдаваться! Теперь ты знаешь, над чем поработать. Вперёд!'}
              </div>
              <div className="result-mascot-aura" />
                        <svg className="phys-mascot result-phys-mascot" viewBox="0 0 220 330" role="img" aria-label="Спортивный маскот PHYSQUEST">
            <defs>
              <linearGradient id="skinTone" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffd9b4"/><stop offset="1" stopColor="#d99568"/></linearGradient>
              <linearGradient id="greenJersey" x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#d0ff75"/><stop offset="1" stopColor="#75b92c"/></linearGradient>
              <linearGradient id="darkShorts" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#303a32"/><stop offset="1" stopColor="#111713"/></linearGradient>
              <radialGradient id="faceLight" cx="35%" cy="25%" r="80%"><stop stopColor="#ffe6ca"/><stop offset="1" stopColor="#d99b70"/></radialGradient>
              <filter id="softShadow" x="-30%" y="-20%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
            </defs>
            <ellipse cx="110" cy="315" rx="58" ry="9" fill="#000" opacity=".2" filter="url(#softShadow)"/>
            <g className="mascot-legs">
              <path d="M82 238 Q105 249 119 242 L112 286 Q108 301 94 300 L80 296Z M119 242 Q139 248 151 237 L150 291 Q148 302 134 301 L119 296Z" fill="url(#skinTone)"/>
              <path d="M76 286 Q94 295 113 287 L111 306 Q92 315 71 304 Q65 298 76 286Z M119 288 Q138 295 154 284 L164 302 Q149 315 122 306Z" fill="#18211a"/>
              <path d="M70 301 Q92 311 112 301 L117 315 Q97 326 67 316 Q60 310 70 301Z M125 302 Q147 307 163 295 L175 309 Q158 327 128 318Z" fill="#f0f2eb"/>
              <path d="M76 307 Q94 313 111 306 M132 309 Q149 313 165 301" stroke="#a8e83c" strokeWidth="4" fill="none"/>
            </g>
            <g className="mascot-torso">
              <path d="M74 151 Q110 132 147 151 L163 243 Q112 263 58 243Z" fill="url(#darkShorts)"/>
              <path d="M79 158 Q110 145 143 158 L149 225 Q111 243 72 225Z" fill="url(#greenJersey)" stroke="#639b25" strokeWidth="2"/>
              <path d="M94 164 Q110 176 127 164 L135 192 L110 207 L86 192Z" fill="#1b261d"/>
              <path d="M92 214 Q110 222 130 214" stroke="#e7ffc0" strokeWidth="3" opacity=".75" fill="none"/>
              <path d="M104 184 L110 189 L116 184 L114 199 L110 203 L106 199Z" fill="#b9f65a"/>
              <text x="110" y="196" textAnchor="middle" fontSize="8" fontWeight="900" fill="#1a241b">P</text>
            </g>
            <g className="mascot-arms">
              <path d="M76 164 Q60 168 57 190 L48 229 Q45 243 56 246 Q67 249 72 235 L91 194Z M145 164 Q161 168 164 190 L173 229 Q176 243 165 246 Q154 249 149 235 L130 194Z" fill="url(#skinTone)"/>
              <path d="M48 229 Q38 228 38 239 Q39 250 53 252 L63 246 L58 234Z M173 229 Q183 228 183 239 Q182 250 168 252 L158 246 L163 234Z" fill="url(#skinTone)"/>
              <path d="M65 178 L76 183 L71 201 L59 197Z M155 178 L144 183 L149 201 L161 197Z" fill="#1b261d"/>
            </g>
            <g className="mascot-head">
              <path d="M75 83 Q76 43 110 39 Q148 39 149 84 L145 123 Q138 151 110 154 Q82 150 75 122Z" fill="url(#faceLight)" stroke="#c8875c" strokeWidth="1.5"/>
              <path d="M74 92 Q61 62 83 38 Q105 15 135 30 Q158 41 153 84 Q144 72 133 64 Q111 80 84 72 L80 104Z" fill="#292f2a"/>
              <path d="M81 54 Q98 29 127 37" stroke="#4c574d" strokeWidth="7" strokeLinecap="round" fill="none"/>
              <path d="M88 103 Q97 96 104 103 M118 103 Q126 96 134 103" stroke="#382820" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="97" cy="111" rx="4.5" ry="6" fill="#202820"/><ellipse cx="126" cy="111" rx="4.5" ry="6" fill="#202820"/>
              <circle cx="98.5" cy="109" r="1.5" fill="#fff"/><circle cx="127.5" cy="109" r="1.5" fill="#fff"/>
              <path d="M111 113 L107 126 L114 128" stroke="#b47752" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M97 137 Q111 146 125 136" stroke="#8c493d" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M75 108 Q69 125 83 139 M147 108 Q153 125 139 139" stroke="#c8875c" strokeWidth="2" fill="none"/>
              <ellipse cx="85" cy="126" rx="7" ry="4" fill="#f39a8b" opacity=".35"/><ellipse cx="136" cy="126" rx="7" ry="4" fill="#f39a8b" opacity=".35"/>
            </g>
          </svg>
            </div>
            <div className="celebration-title">УРА! ТЫ ЭТО СДЕЛАЛ!</div>
            <p className="celebration-subtitle">28 заданий позади. Маскот гордится тобой!</p>
          </div>

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

      <section className="quiz-content quiz-layout">
        <aside className={`mascot-side mascot-pose-${index % 4} ${current !== undefined ? 'mascot-active' : ''}`} aria-label="Помощник PHYSQUEST">
          <div className="mascot-bubble">{['Ты справишься!', 'Отличный темп!', 'Не сдавайся!', 'Ещё один шаг!'][index % 4]}</div>
          <svg className="phys-mascot" viewBox="0 0 220 330" role="img" aria-label="Спортивный маскот PHYSQUEST">
            <defs>
              <linearGradient id="skinTone" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffd9b4"/><stop offset="1" stopColor="#d99568"/></linearGradient>
              <linearGradient id="greenJersey" x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#d0ff75"/><stop offset="1" stopColor="#75b92c"/></linearGradient>
              <linearGradient id="darkShorts" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#303a32"/><stop offset="1" stopColor="#111713"/></linearGradient>
              <radialGradient id="faceLight" cx="35%" cy="25%" r="80%"><stop stopColor="#ffe6ca"/><stop offset="1" stopColor="#d99b70"/></radialGradient>
              <filter id="softShadow" x="-30%" y="-20%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
            </defs>
            <ellipse cx="110" cy="315" rx="58" ry="9" fill="#000" opacity=".2" filter="url(#softShadow)"/>
            <g className="mascot-legs">
              <path d="M82 238 Q105 249 119 242 L112 286 Q108 301 94 300 L80 296Z M119 242 Q139 248 151 237 L150 291 Q148 302 134 301 L119 296Z" fill="url(#skinTone)"/>
              <path d="M76 286 Q94 295 113 287 L111 306 Q92 315 71 304 Q65 298 76 286Z M119 288 Q138 295 154 284 L164 302 Q149 315 122 306Z" fill="#18211a"/>
              <path d="M70 301 Q92 311 112 301 L117 315 Q97 326 67 316 Q60 310 70 301Z M125 302 Q147 307 163 295 L175 309 Q158 327 128 318Z" fill="#f0f2eb"/>
              <path d="M76 307 Q94 313 111 306 M132 309 Q149 313 165 301" stroke="#a8e83c" strokeWidth="4" fill="none"/>
            </g>
            <g className="mascot-torso">
              <path d="M74 151 Q110 132 147 151 L163 243 Q112 263 58 243Z" fill="url(#darkShorts)"/>
              <path d="M79 158 Q110 145 143 158 L149 225 Q111 243 72 225Z" fill="url(#greenJersey)" stroke="#639b25" strokeWidth="2"/>
              <path d="M94 164 Q110 176 127 164 L135 192 L110 207 L86 192Z" fill="#1b261d"/>
              <path d="M92 214 Q110 222 130 214" stroke="#e7ffc0" strokeWidth="3" opacity=".75" fill="none"/>
              <path d="M104 184 L110 189 L116 184 L114 199 L110 203 L106 199Z" fill="#b9f65a"/>
              <text x="110" y="196" textAnchor="middle" fontSize="8" fontWeight="900" fill="#1a241b">P</text>
            </g>
            <g className="mascot-arms">
              <path d="M76 164 Q60 168 57 190 L48 229 Q45 243 56 246 Q67 249 72 235 L91 194Z M145 164 Q161 168 164 190 L173 229 Q176 243 165 246 Q154 249 149 235 L130 194Z" fill="url(#skinTone)"/>
              <path d="M48 229 Q38 228 38 239 Q39 250 53 252 L63 246 L58 234Z M173 229 Q183 228 183 239 Q182 250 168 252 L158 246 L163 234Z" fill="url(#skinTone)"/>
              <path d="M65 178 L76 183 L71 201 L59 197Z M155 178 L144 183 L149 201 L161 197Z" fill="#1b261d"/>
            </g>
            <g className="mascot-head">
              <path d="M75 83 Q76 43 110 39 Q148 39 149 84 L145 123 Q138 151 110 154 Q82 150 75 122Z" fill="url(#faceLight)" stroke="#c8875c" strokeWidth="1.5"/>
              <path d="M74 92 Q61 62 83 38 Q105 15 135 30 Q158 41 153 84 Q144 72 133 64 Q111 80 84 72 L80 104Z" fill="#292f2a"/>
              <path d="M81 54 Q98 29 127 37" stroke="#4c574d" strokeWidth="7" strokeLinecap="round" fill="none"/>
              <path d="M88 103 Q97 96 104 103 M118 103 Q126 96 134 103" stroke="#382820" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="97" cy="111" rx="4.5" ry="6" fill="#202820"/><ellipse cx="126" cy="111" rx="4.5" ry="6" fill="#202820"/>
              <circle cx="98.5" cy="109" r="1.5" fill="#fff"/><circle cx="127.5" cy="109" r="1.5" fill="#fff"/>
              <path d="M111 113 L107 126 L114 128" stroke="#b47752" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M97 137 Q111 146 125 136" stroke="#8c493d" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M75 108 Q69 125 83 139 M147 108 Q153 125 139 139" stroke="#c8875c" strokeWidth="2" fill="none"/>
              <ellipse cx="85" cy="126" rx="7" ry="4" fill="#f39a8b" opacity=".35"/><ellipse cx="136" cy="126" rx="7" ry="4" fill="#f39a8b" opacity=".35"/>
            </g>
          </svg>
        </aside>
        <div className="question-main">
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

        {q.type === 'multi' && (
          <div className="order-list multi-choice-list">
            <p className="input-hint">ОТМЕТЬ НЕ МЕНЕЕ ПЯТИ ПРАВИЛЬНЫХ ТРЕБОВАНИЙ. НЕВЕРНЫЕ ВАРИАНТЫ НЕ ВЫБИРАЙ.</p>
            {q.opts.map((option: string, i: number) => {
              const selected = (current ?? []).includes(i)
              return (
                <button
                  type="button"
                  key={i}
                  className={`order-item ${selected ? 'selected' : ''}`}
                  onClick={() => setAnswer(selected ? current.filter((x: number) => x !== i) : [...(current ?? []), i])}
                >
                  <span className="order-index">{selected ? '✓' : '+'}</span>
                  <span>{option}</span>
                  <span className="order-status">{selected ? 'ВЫБРАНО' : 'ВЫБРАТЬ'}</span>
                </button>
              )
            })}
            <p className="text-list-counter">ВЫБРАНО: {(current ?? []).length} · МИНИМУМ: 5</p>
            <button className="reset-order" type="button" onClick={() => setAnswer([])}>↻ СБРОСИТЬ ВЫБОР</button>
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
        </div>
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
