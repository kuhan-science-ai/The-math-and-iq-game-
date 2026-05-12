import { BrainCircuit, Timer, Zap } from "lucide-react";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, modes } from "../lib/api.js";

const aptitudeBank = [
  { q: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "48"], answer: "42" },
  { q: "Book is to Reading as Fork is to ?", options: ["Drawing", "Writing", "Eating", "Cooking"], answer: "Eating" },
  { q: "Find the odd one out.", options: ["Triangle", "Square", "Circle", "Cube"], answer: "Cube" },
  { q: "If ALL BLOPS are RAZZIES and some RAZZIES are LAZZIES, which is certain?", options: ["Some BLOPS are LAZZIES", "All RAZZIES are BLOPS", "All BLOPS are RAZZIES", "No LAZZIES are BLOPS"], answer: "All BLOPS are RAZZIES" },
  { q: "3, 9, 27, 81, ?", options: ["108", "162", "243", "324"], answer: "243" }
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeMathQuestion = (difficulty = 1) => {
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
  return { q: `${a} ${op} ${b}`, answer: String(answer) };
};

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

      {mode === "speedMath" && <QuizMode mode="speedMath" duration={30} title="Speed Math Sprint" />}
      {mode === "aptitude" && <AptitudeMode />}
      {mode === "reaction" && <ReactionMode />}
      {mode === "challenge" && <QuizMode mode="challenge" duration={60} title="Challenge Ladder" challenge />}
    </section>
  );
};

const QuizMode = ({ mode, duration, title, challenge = false }) => {
  const { setUser } = useAuth();
  const [time, setTime] = useState(duration);
  const [running, setRunning] = useState(false);
  const [question, setQuestion] = useState(makeMathQuestion(1));
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
    setQuestion(makeMathQuestion(1));
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
    const wasCorrect = answer.trim() === question.answer;
    const nextCorrect = correct + (wasCorrect ? 1 : 0);
    const nextAttempts = attempts + 1;
    setCorrect(nextCorrect);
    setAttempts(nextAttempts);
    setAnswer("");
    setQuestion(makeMathQuestion(challenge ? difficulty : 1));

  };

  return (
    <div className="game-board">
      <div className="game-meta">
        <span><Timer size={18} /> {time}s</span>
        <span><Zap size={18} /> {correct} correct</span>
        {challenge && <span>Difficulty {difficulty}</span>}
      </div>
      <h2>{title}</h2>
      <div className="question">{running ? question.q : "Ready?"}</div>
      <form className="answer-row" onSubmit={submit}>
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!running} autoFocus />
        <button className="primary" type="submit" disabled={!running}>Submit</button>
      </form>
      {!running && <button className="secondary" onClick={start}>Start {duration}s round</button>}
      {message && <p className="success">{message}</p>}
    </div>
  );
};

const AptitudeMode = () => {
  const { setUser } = useAuth();
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const current = aptitudeBank[index];

  const choose = async (option) => {
    const nextCorrect = correct + (option === current.answer ? 1 : 0);
    setCorrect(nextCorrect);
    if (index === aptitudeBank.length - 1) {
      const accuracy = Math.round((nextCorrect / aptitudeBank.length) * 100);
      const data = await api("/game/submit-score", {
        method: "POST",
        body: JSON.stringify({ mode: "aptitude", score: nextCorrect * 10, accuracy })
      });
      setUser(data.user);
      setDone(true);
      setMessage(`Round saved. ${accuracy}% accuracy and +${data.xpGain} XP.`);
    } else {
      setIndex(index + 1);
    }
  };

  const reset = () => {
    setIndex(0);
    setCorrect(0);
    setDone(false);
    setMessage("");
  };

  return (
    <div className="game-board">
      <div className="game-meta"><span><BrainCircuit size={18} /> Question {Math.min(index + 1, aptitudeBank.length)}/{aptitudeBank.length}</span></div>
      <h2>Aptitude Logic Set</h2>
      <div className="question">{done ? "Complete" : current.q}</div>
      {!done && <div className="options">{current.options.map((option) => <button key={option} onClick={() => choose(option)}>{option}</button>)}</div>}
      {done && <button className="secondary" onClick={reset}>Play again</button>}
      {message && <p className="success">{message}</p>}
    </div>
  );
};

const ReactionMode = () => {
  const { setUser } = useAuth();
  const [state, setState] = useState("idle");
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const arm = () => {
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
    if (state === "waiting") return "Wait for green";
    if (state === "go") return "Click now";
    return result ? `${result}ms` : "Start reaction test";
  }, [state, result]);

  return (
    <div className={`reaction-pad ${state}`} onClick={click}>
      <h2>{panelText}</h2>
      <button className="secondary" onClick={(event) => { event.stopPropagation(); arm(); }}>Arm test</button>
      {message && <p>{message}</p>}
    </div>
  );
};
