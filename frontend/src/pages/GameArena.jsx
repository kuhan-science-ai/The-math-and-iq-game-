import { BrainCircuit, Timer, Zap } from "lucide-react";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, modes } from "../lib/api.js";
import { aptitudeCounts, aptitudeLevels } from "../lib/aptitudeQuestions.js";

const aptitudeBank = Object.values(aptitudeLevels).flatMap((level) => level.questions);


const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (items) => items[randomInt(0, items.length - 1)];
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const normalizeAnswer = (value) => String(value).trim().toLowerCase().replace(/\s+/g, "");

const makeMathQuestion = (difficulty = 1) => {
  const factories = [
    makeArithmeticQuestion,
    makeFractionQuestion,
    makePowerQuestion,
    makePercentQuestion,
    makeEquationQuestion,
    makeOrderQuestion
  ];
  return pick(factories)(difficulty);
};

const makeArithmeticQuestion = (difficulty = 1) => {
  const ops = ["+", "-", "*", "/"];
  const op = ops[randomInt(0, difficulty > 1 ? 3 : 2)];
  let a = randomInt(3, 12 + difficulty * 8);
  let b = randomInt(2, 10 + difficulty * 5);
  if (op === "/") {
    const answer = randomInt(2, 12);
    b = randomInt(2, 9);
    a = answer * b;
  }
  const answer = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
  const latexOp = op === "*" ? "\\times" : op === "/" ? "\\div" : op;
  return { category: "Arithmetic", q: `${a} ${op} ${b}`, latex: `${a}\\ ${latexOp}\\ ${b}`, answer: String(answer), inputMode: "numeric" };
};

const makeFractionQuestion = (difficulty = 1) => {
  const denominator = randomInt(3, 8 + difficulty);
  const left = randomInt(1, denominator - 1);
  const right = randomInt(1, denominator - 1);
  const answer = left + right;
  return {
    category: "Fractions",
    q: `${left}/${denominator} + ${right}/${denominator}`,
    latex: "\\frac{" + left + "}{" + denominator + "} + \\frac{" + right + "}{" + denominator + "}",
    answer: `${answer}/${denominator}`,
    hint: "Answer as a fraction, like 3/7"
  };
};

const makePowerQuestion = (difficulty = 1) => {
  const base = randomInt(2, 8 + difficulty);
  const power = randomInt(2, difficulty > 3 ? 3 : 2);
  const answer = base ** power;
  return {
    category: "Powers",
    q: `${base}^${power}`,
    latex: `${base}^{${power}}`,
    answer: String(answer),
    inputMode: "numeric"
  };
};

const makePercentQuestion = (difficulty = 1) => {
  const percent = pick([10, 12.5, 20, 25, 30, 40, 50, 75]);
  const number = randomInt(4, 12 + difficulty * 8) * 10;
  const answer = (percent / 100) * number;
  return {
    category: "Percentages",
    q: `${percent}% of ${number}`,
    latex: `${percent}\\%\\ \\text{of}\\ ${number}`,
    answer: String(Number.isInteger(answer) ? answer : answer.toFixed(1)),
    inputMode: "decimal"
  };
};

const makeEquationQuestion = (difficulty = 1) => {
  const x = randomInt(2, 10 + difficulty);
  const a = randomInt(2, 6 + difficulty);
  const b = randomInt(3, 15 + difficulty * 2);
  const total = a * x + b;
  return {
    category: "Equations",
    q: `Solve: ${a}x + ${b} = ${total}`,
    latex: `${a}x + ${b} = ${total}`,
    answer: String(x),
    inputMode: "numeric"
  };
};

const makeOrderQuestion = (difficulty = 1) => {
  const a = randomInt(2, 8 + difficulty);
  const b = randomInt(2, 6 + difficulty);
  const c = randomInt(2, 9 + difficulty);
  const answer = a + b * c;
  return {
    category: "Order of operations",
    q: `${a} + ${b} x ${c}`,
    latex: `${a} + ${b}\\times${c}`,
    answer: String(answer),
    inputMode: "numeric"
  };
};

const makeChallengeQuestion = (difficulty = 1) => {
  if (Math.random() < 0.68) return makeMathQuestion(difficulty);
  const item = pick(aptitudeBank);
  return { ...item, category: `Logic: ${item.category}` };
};

const reactionPrompts = [
  { target: "green", label: "Click on green", className: "go-green" },
  { target: "cyan", label: "Click on cyan", className: "go-cyan" },
  { target: "orange", label: "Click on orange", className: "go-orange" }
];

const renderLatexish = (value) => {
  if (!value) return null;
  const parts = [];
  let rest = value;
  let key = 0;
  const fractionPattern = /\\frac\{([^{}]+)\}\{([^{}]+)\}/;

  while (rest.length) {
    const match = rest.match(fractionPattern);
    if (!match || match.index == null) {
      parts.push(<span key={key++}>{cleanLatex(rest)}</span>);
      break;
    }
    if (match.index > 0) parts.push(<span key={key++}>{cleanLatex(rest.slice(0, match.index))}</span>);
    parts.push(
      <span className="latex-fraction" key={key++}>
        <span>{cleanLatex(match[1])}</span>
        <span>{cleanLatex(match[2])}</span>
      </span>
    );
    rest = rest.slice(match.index + match[0].length);
  }

  return parts;
};

const cleanLatex = (value) =>
  value
    .replace(/\\times/g, "x")
    .replace(/\\div/g, "/")
    .replace(/\\quad/g, " ")
    .replace(/\\cdots/g, "...")
    .replace(/\\ldots/g, "...")
    .replace(/\\bmod/g, "mod")
    .replace(/\\circ/g, " deg")
    .replace(/\\subset/g, " subset ")
    .replace(/\\to/g, "->")
    .replace(/\\Rightarrow/g, "=>")
    .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, "sum($1 to $2)")
    .replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, "int($1 to $2)")
    .replace(/\\lfloor/g, "floor(")
    .replace(/\\rfloor/g, ")")
    .replace(/\\infty/g, "infinity")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\det/g, "det")
    .replace(/\\phi/g, "phi")
    .replace(/\\bigg\|/g, "|")
    .replace(/\\text\{([^{}]+)\}/g, "$1")
    .replace(/\\binom\{([^{}]+)\}\{([^{}]+)\}/g, "C($1,$2)")
    .replace(/\\%/g, "%")
    .replace(/\^\{([^{}]+)\}/g, "^$1")
    .replace(/_\{([^{}]+)\}/g, "_$1")
    .replace(/\\/g, "")
    .replace(/\s+/g, " ");

const QuestionDisplay = ({ question, fallback }) => (
  <div className="question">
    {question?.category && <span className="question-tag">{question.category}</span>}
    {question?.q && <p className="question-prompt">{question.q}</p>}
    <div className="question-main">{question ? renderLatexish(question.latex || question.q) : fallback}</div>
    {question?.hint && <small>{question.hint}</small>}
  </div>
);

export const GameArena = () => {
  const [mode, setMode] = useState("speedMath");

  return (
    <section className="screen">
      <div className="topline">
        <div>
          <p className="eyebrow">Training arena</p>
          <h1>Choose a game mode</h1>
        </div>
        <div className="mode-tabs">
          {Object.entries(modes).map(([key, label]) => (
            <button key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "speedMath" && <QuizMode mode="speedMath" duration={30} title="Speed Math Sprint" generator={makeMathQuestion} />}
      {mode === "aptitude" && <AptitudeMode />}
      {mode === "reaction" && <ReactionMode />}
      {mode === "challenge" && <QuizMode mode="challenge" duration={60} title="Challenge Ladder" generator={makeChallengeQuestion} challenge />}
    </section>
  );
};

const QuizMode = ({ mode, duration, title, generator, challenge = false }) => {
  const { setUser } = useAuth();
  const [time, setTime] = useState(duration);
  const [running, setRunning] = useState(false);
  const [question, setQuestion] = useState(generator(1));
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const savedRef = useRef(false);
  const difficulty = Math.min(5, Math.floor(correct / 5) + 1);

  const start = () => {
    savedRef.current = false;
    setTime(duration);
    setCorrect(0);
    setAttempts(0);
    setQuestion(generator(1));
    setAnswer("");
    setMessage("");
    setRunning(true);
    const timer = setInterval(() => {
      setTime((value) => {
        if (value <= 1) {
          clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const saveRound = async () => {
      if (running || time !== 0 || savedRef.current || attempts === 0) return;
      savedRef.current = true;
      const accuracy = Math.round((correct / attempts) * 100);
      const data = await api("/game/submit-score", {
        method: "POST",
        body: JSON.stringify({ mode, score: correct, accuracy })
      });
      setUser(data.user);
      setMessage(`Saved ${correct} points and earned ${data.xpGain} XP.`);
    };

    saveRound();
  }, [attempts, correct, mode, running, setUser, time]);

  const submit = async (event) => {
    event.preventDefault();
    if (!running) return;
    const submittedAnswer = event.overrideAnswer ?? answer;
    const wasCorrect = normalizeAnswer(submittedAnswer) === normalizeAnswer(question.answer);
    const nextCorrect = correct + (wasCorrect ? 1 : 0);
    const nextAttempts = attempts + 1;
    setCorrect(nextCorrect);
    setAttempts(nextAttempts);
    setAnswer("");
    setQuestion(generator(challenge ? difficulty : 1));

  };

  const chooseOption = (option) => {
    submit({ preventDefault: () => {}, overrideAnswer: option });
  };

  return (
    <div className="game-board">
      <div className="game-meta">
        <span><Timer size={18} /> {time}s</span>
        <span><Zap size={18} /> {correct} correct</span>
        {challenge && <span>Difficulty {difficulty}</span>}
      </div>
      <h2>{title}</h2>
      {running ? <QuestionDisplay question={question} /> : <QuestionDisplay fallback="Ready?" />}
      {running && question.options ? (
        <div className="options">{question.options.map((option) => <button key={option} onClick={() => chooseOption(option)}>{option}</button>)}</div>
      ) : (
        <form className="answer-row" onSubmit={submit}>
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!running} inputMode={question.inputMode || "text"} autoFocus />
          <button className="primary" type="submit" disabled={!running}>Submit</button>
        </form>
      )}
      {!running && <button className="secondary" onClick={start}>Start {duration}s round</button>}
      {message && <p className="success">{message}</p>}
    </div>
  );
};

const AptitudeMode = () => {
  const { setUser } = useAuth();
  const [level, setLevel] = useState("easy");
  const [questionCount, setQuestionCount] = useState(10);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [message, setMessage] = useState("");
  const levelConfig = aptitudeLevels[level];
  const current = roundQuestions[index];

  const buildRound = () => {
    const pool = levelConfig.questions;
    const questions = Array.from({ length: questionCount }, (_, questionIndex) => ({
      ...shuffle(pool)[questionIndex % pool.length],
      roundId: `${level}-${questionIndex}-${Math.random()}`
    }));

    setRoundQuestions(questions);
    setIndex(0);
    setCorrect(0);
    setDone(false);
    setMessage("");
    setStarted(true);
  };

  const choose = async (option) => {
    const nextCorrect = correct + (option === current.answer ? 1 : 0);
    setCorrect(nextCorrect);
    if (index === roundQuestions.length - 1) {
      const accuracy = Math.round((nextCorrect / roundQuestions.length) * 100);
      const score = Math.round(nextCorrect * 10 * levelConfig.multiplier);
      const data = await api("/game/submit-score", {
        method: "POST",
        body: JSON.stringify({ mode: "aptitude", score, accuracy })
      });
      setUser(data.user);
      setDone(true);
      setCelebrate(true);
      setMessage(`${levelConfig.label} round saved. Score ${score}, ${accuracy}% accuracy, +${data.xpGain} XP.`);
      setTimeout(() => setCelebrate(false), 2600);
    } else {
      setIndex(index + 1);
    }
  };

  const reset = () => {
    setStarted(false);
    setRoundQuestions([]);
    setIndex(0);
    setCorrect(0);
    setDone(false);
    setCelebrate(false);
    setMessage("");
  };

  return (
    <div className="game-board">
      <div className="game-meta">
        <span><BrainCircuit size={18} /> {levelConfig.label}</span>
        <span>{questionCount} questions</span>
        {started && <span>Question {Math.min(index + 1, roundQuestions.length)}/{roundQuestions.length}</span>}
        <span>{levelConfig.multiplier}x XP pace</span>
      </div>
      <h2>Aptitude Logic Set</h2>
      {celebrate && (
        <div className="celebration" aria-live="polite">
          <div className="party-poppers">
            {Array.from({ length: 18 }, (_, particle) => <i key={particle} style={{ "--i": particle }} />)}
          </div>
          <strong>Level complete</strong>
          <span>{levelConfig.label} cleared with {correct}/{roundQuestions.length}</span>
        </div>
      )}

      {!started && (
        <div className="aptitude-setup">
          <div>
            <p className="control-label">Level</p>
            <div className="choice-grid">
              {Object.entries(aptitudeLevels).map(([key, config]) => (
                <button key={key} className={level === key ? "active" : ""} onClick={() => setLevel(key)}>
                  <strong>{config.label}</strong>
                  <small>{config.multiplier}x score</small>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="control-label">Questions</p>
            <div className="count-grid">
              {aptitudeCounts.map((count) => (
                <button key={count} className={questionCount === count ? "active" : ""} onClick={() => setQuestionCount(count)}>
                  {count}
                </button>
              ))}
            </div>
          </div>
          <button className="primary" onClick={buildRound}>Start {levelConfig.label} round</button>
        </div>
      )}

      {started && (done ? <QuestionDisplay fallback="Complete" /> : <QuestionDisplay question={current} />)}
      {started && !done && <div className="options">{current.options.map((option) => <button key={option} onClick={() => choose(option)}>{option}</button>)}</div>}
      {started && done && <button className="secondary" onClick={reset}>Configure new round</button>}
      {message && <p className="success">{message}</p>}
    </div>
  );
};

const ReactionMode = () => {
  const { setUser } = useAuth();
  const [state, setState] = useState("idle");
  const [prompt, setPrompt] = useState(reactionPrompts[0]);
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const arm = () => {
    const nextPrompt = pick(reactionPrompts);
    setPrompt(nextPrompt);
    setState("waiting");
    setResult(null);
    setMessage("");
    setTimeout(() => {
      setStartedAt(performance.now());
      setState("go");
    }, randomInt(1200, 4200));
  };

  const click = async () => {
    if (state === "waiting") {
      setState("idle");
      setMessage("Too early. Reset and wait for the color change.");
      return;
    }
    if (state !== "go") return;

    const reactionTime = Math.round(performance.now() - startedAt);
    const score = Math.max(1, 1000 - reactionTime);
    const data = await api("/game/submit-score", {
      method: "POST",
      body: JSON.stringify({ mode: "reaction", score, accuracy: 100, reactionTime })
    });
    setUser(data.user);
    setResult(reactionTime);
    setState("idle");
    setMessage(`Saved ${reactionTime}ms reaction. +${data.xpGain} XP.`);
  };

  const panelText = useMemo(() => {
    if (state === "waiting") return prompt.label;
    if (state === "go") return "Click now";
    return result ? `${result}ms` : "Start reaction test";
  }, [state, result, prompt.label]);

  return (
    <div className={`reaction-pad ${state} ${state === "go" ? prompt.className : ""}`} onClick={click}>
      <h2>{panelText}</h2>
      <p>{state === "idle" ? "Color, focus, and impulse-control drills rotate every attempt." : "React only after the panel changes color."}</p>
      <button className="secondary" onClick={(event) => { event.stopPropagation(); arm(); }}>Arm test</button>
      {message && <p>{message}</p>}
    </div>
  );
};
