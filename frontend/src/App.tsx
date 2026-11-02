
import { useMemo, useState } from 'react'
import questions from './questions.json'
import './index.css'
import gymnastics from './assets/gymnastics.png'

type Question = any

const letters = ['А', 'Б', 'В', 'Г', 'Д']

const typeLabels: Record<string, string> = {
  single: 'ВЫБОР ОТВЕТА',
  image: 'ВОПРОС ПО КАРТИНКЕ',
  text: 'ВВЕДИ ТЕРМИН',
  match: 'СООТВЕТСТВИЕ',
  order: 'ПОРЯДОК ДЕЙСТВИЙ',
  long: 'РАЗВЁРНУТЫЙ ОТВЕТ',
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
    setStarted(false)
  }

  const reviewAnswers = () => {
    setStarted(true)
    setFinished(false)
    setIndex(0)
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

      <section className="quiz-content">
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

        {q.type === 'match' && (
          <div className="match-list">
            {q.pairs.map((pair: string[], i: number) => (
              <div className="match-row" key={i}>
                <div className="match-name">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <b>{pair[0]}</b>
                </div>

                <select
                  value={current?.[i] ?? ''}
                  onChange={e => {
                    const next = [
                      ...(current ?? Array(q.pairs.length).fill(''))
                    ]

                    next[i] = e.target.value
                    setAnswer(next)
                  }}
                >
                  <option value="">Выбери вариант</option>

                  {(q.choices ?? letters).map((choice: string, j: number) => (
                    <option
                      key={j}
                      value={q.id === 28 ? choice : String(j)}
                    >
                      {choice}
                    </option>
                  ))}
                </select>
              </div>
            ))}
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
