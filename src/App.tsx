import { useState } from 'react'
import { bank, categories, type Category } from './questions'

type Choice = Category | 'Mixed'
type Question = { q: string; options: string[]; answer: string }

const ROUND_SIZE = 10

// Returns a shuffled copy of a list
function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Picks up to 10 random questions from the chosen category and shuffles their options
function newRound(choice: Choice): Question[] {
  const pool = choice === 'Mixed' ? bank : bank.filter((item) => item.category === choice)
  return shuffle(pool)
    .slice(0, ROUND_SIZE)
    .map(({ q, options }) => ({
      q,
      answer: options[0],
      options: shuffle(options),
    }))
}

function verdict(ratio: number) {
  if (ratio >= 0.9) return 'Proper Naija expert.'
  if (ratio >= 0.6) return 'Not bad at all. You know your country.'
  if (ratio >= 0.3) return 'Decent start. Play again and beat it.'
  return 'Time to do some reading, then come back.'
}

const App = () => {
  const [choice, setChoice] = useState<Choice | null>(null)
  const [round, setRound] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const total = round.length
  const finished = index >= total
  const current = round[index]
  const label = choice && choice !== 'Mixed' ? ` (${choice})` : ''
  const shareText = `I got ${score}/${total} on the Naija Quiz${label}. Can you beat me?`

  const start = (c: Choice) => {
    setChoice(c)
    setRound(newRound(c))
    setIndex(0)
    setScore(0)
    setPicked(null)
    setCopied(false)
  }

  const answer = (option: string) => {
    if (picked) return
    setPicked(option)
    if (option === current.answer) setScore(score + 1)
  }

  const next = () => {
    setPicked(null)
    setIndex(index + 1)
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main>
      <h1>Naija Quiz</h1>
      <p className="sub">Ten random questions every round. How well do you know Nigeria?</p>

      {choice === null ? (
        <div className="card">
          <p className="q">Pick a category</p>
          {(['Mixed', ...categories] as Choice[]).map((c) => (
            <button key={c} className="opt" onClick={() => start(c)}>
              {c === 'Mixed' ? 'Mixed (all categories)' : c}
            </button>
          ))}
        </div>
      ) : !finished ? (
        <div className="card">
          <div className="bar">
            <i style={{ width: `${(index / total) * 100}%` }} />
          </div>
          <div className="meta">
            Question {index + 1} of {total}
          </div>
          <p className="q">{current.q}</p>

          {current.options.map((option) => {
            let cls = 'opt'
            if (picked) {
              if (option === current.answer) cls += ' right'
              else if (option === picked) cls += ' wrong'
            }
            return (
              <button key={option} className={cls} disabled={!!picked} onClick={() => answer(option)}>
                {option}
              </button>
            )
          })}

          {picked && (
            <button className="btn" onClick={next}>
              {index === total - 1 ? 'See my score' : 'Next question'}
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <p className="score">
            {score}/{total}
          </p>
          <p>{verdict(score / total)}</p>
          <div className="share">{shareText}</div>
          <button className="btn" onClick={copyResult}>
            {copied ? 'Copied' : 'Copy result'}
          </button>
          <button className="btn ghost" onClick={() => start(choice)}>
            New round
          </button>
          <button className="btn ghost" onClick={() => setChoice(null)}>
            Change category
          </button>
        </div>
      )}
    </main>
  )
}

export default App
