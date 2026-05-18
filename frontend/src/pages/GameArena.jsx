import { BrainCircuit, Timer, Zap } from "lucide-react";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, modes } from "../lib/api.js";

const aptitudeLevels = {
  easy: {
    label: "Easy",
    multiplier: 1,
    questions: [
      { category: "Number series", q: "Complete the pattern.", latex: "2,\\ 4,\\ 6,\\ 8,\\ ?", options: ["9", "10", "11", "12"], answer: "10" },
      { category: "Analogy", q: "Complete the relationship: hand is to glove as foot is to...", latex: "\\text{hand} : \\text{glove} = \\text{foot} : ?", options: ["Sock", "Ring", "Cap", "Belt"], answer: "Sock" },
      { category: "Classification", q: "Choose the item that does not belong with the others.", latex: "\\text{apple},\\ \\text{mango},\\ \\text{carrot},\\ \\text{banana}", options: ["Apple", "Mango", "Carrot", "Banana"], answer: "Carrot" },
      { category: "Direction", q: "You face north and turn right. Which direction are you facing now?", latex: "\\text{north} + \\text{right turn} = ?", options: ["North", "South", "East", "West"], answer: "East" },
      { category: "Fraction", q: "Which fraction is larger?", latex: "\\frac{1}{2}\\ \\text{or}\\ \\frac{1}{4}", options: ["1/2", "1/4", "Equal", "Cannot tell"], answer: "1/2" },
      { category: "Coding", q: "Using A = 1, B = 2, C = 3, find the value of CAB.", latex: "C + A + B = ?", options: ["5", "6", "7", "8"], answer: "6" }
    ]
  },
  medium: {
    label: "Medium",
    multiplier: 1.6,
    questions: [
      { category: "Number series", q: "Each term is doubled. Find the missing number.", latex: "3,\\ 6,\\ 12,\\ 24,\\ ?", options: ["36", "42", "48", "54"], answer: "48" },
      { category: "Pattern", q: "Letters move by +2, +3, +4... and numbers are triangular. What comes next?", latex: "A1,\\ C3,\\ F6,\\ J10,\\ ?", options: ["L12", "M13", "N14", "O15"], answer: "O15" },
      { category: "Probability", q: "A fair die is rolled once. What is the probability of rolling an even number?", latex: "\\frac{3}{6}=\\frac{1}{2}", options: ["1/6", "1/3", "1/2", "2/3"], answer: "1/2" },
      { category: "Ratio", q: "If 4 machines make 20 parts in 5 hours, how many parts do 8 machines make in the same time?", latex: "4\\ \\text{machines} \\to 20,\\quad 8\\ \\text{machines} \\to ?", options: ["20", "30", "40", "80"], answer: "40" },
      { category: "Syllogism", q: "All squares are rectangles. Some rectangles are blue. Which statement is definitely true?", latex: "\\text{squares} \\subset \\text{rectangles}", options: ["All squares are blue", "Some blue things are squares", "All squares are rectangles", "No rectangles are squares"], answer: "All squares are rectangles" },
      { category: "Equation", q: "Solve for x.", latex: "3x + 7 = 22", options: ["3", "4", "5", "6"], answer: "5" }
    ]
  },
  insane: {
    label: "Insane",
    multiplier: 2.4,
    questions: [
      { category: "Alternating series", q: "Two interleaved patterns are mixed together. Find the next term.", latex: "4,\\ 9,\\ 7,\\ 14,\\ 10,\\ 19,\\ ?", options: ["12", "13", "14", "16"], answer: "13" },
      { category: "Weighted average", q: "Average of 5 numbers is 18. Four of them average 16. Find the fifth number.", latex: "(5\\times18)-(4\\times16)=?", options: ["22", "24", "26", "28"], answer: "26" },
      { category: "Permutation", q: "How many different arrangements are possible for A, B, and C?", latex: "3! = ?", options: ["3", "6", "9", "12"], answer: "6" },
      { category: "Logic order", q: "Mira is taller than Dev. Dev is taller than Isha. Who is shortest?", latex: "\\text{Mira} > \\text{Dev} > \\text{Isha}", options: ["Mira", "Dev", "Isha", "Cannot tell"], answer: "Isha" },
      { category: "Clock angle", q: "At 3:30, what is the smaller angle between the hour hand and minute hand?", latex: "\\theta = |90^\\circ - 15^\\circ|", options: ["60°", "75°", "90°", "105°"], answer: "75°" },
      { category: "Fraction equation", q: "Solve for x.", latex: "\\frac{x}{3} + 4 = 9", options: ["12", "15", "18", "21"], answer: "15" }
    ]
  },
  impossible: {
    label: "Impossible",
    multiplier: 3.5,
    questions: [
      { category: "Nested sequence", q: "Each term is double the previous term plus 1. Find the next term.", latex: "a_n = 2a_{n-1}+1,\\quad 2,\\ 5,\\ 11,\\ 23,\\ 47,\\ ?", options: ["91", "93", "95", "97"], answer: "95" },
      { category: "Bayes intuition", q: "1% have condition X. A test is 99% true-positive and 5% false-positive. A positive result is closest to which chance?", latex: "\\frac{0.01\\times0.99}{(0.01\\times0.99)+(0.99\\times0.05)}", options: ["17%", "50%", "83%", "99%"], answer: "17%" },
      { category: "Constraint logic", q: "Exactly one statement is true: A says B is true. B says C is false. C says A is false. Which statement is true?", latex: "\\text{exactly one of } A,B,C \\text{ is true}", options: ["A", "B", "C", "None"], answer: "B" },
      { category: "Modular arithmetic", q: "Find the remainder when 7 to the fourth power is divided by 5.", latex: "7^{4}\\ \\bmod\\ 5", options: ["0", "1", "2", "4"], answer: "1" },
      { category: "Combinatorics", q: "How many ways can 2 captains be chosen from 6 players?", latex: "\\binom{6}{2}=?", options: ["12", "15", "18", "30"], answer: "15" },
      { category: "Inequality", q: "If x is an integer, what is the largest possible value of x?", latex: "2x+3<12", options: ["3", "4", "5", "6"], answer: "4" }
    ]
  }
};

const aptitudeCounts = [5, 10, 15, 20];
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
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\quad/g, " ")
    .replace(/\\bmod/g, "mod")
    .replace(/\\circ/g, "°")
    .replace(/\\subset/g, "⊂")
    .replace(/\\to/g, "→")
    .replace(/\\binom\{([^{}]+)\}\{([^{}]+)\}/g, "C($1,$2)")
    .replace(/\\%/g, "%")
    .replace(/\\text\{([^{}]+)\}/g, "$1")
    .replace(/\^\{([^{}]+)\}/g, "^$1")
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
      setMessage(`${levelConfig.label} round saved. Score ${score}, ${accuracy}% accuracy, +${data.xpGain} XP.`);
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
