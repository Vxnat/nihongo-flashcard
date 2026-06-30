import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { playSFX } from "@/utils/sfx";
import { playAudio } from "@/utils/tts";

interface BlankDetail {
  correctAnswer: string;
  wrongAnswers: string[];
  hint: string;
  reading?: string;
  meaning?: string;
  romaji?: string;
}

interface QuizItem {
  id: string;
  sentence: string;
  translation: string;
  blanks: BlankDetail[];
}

interface UseFillBlanksGameProps {
  quizList: QuizItem[];
  minigameDeck: any;
  onWin: () => void;
}

export function useFillBlanksGame({
  quizList = [],
  minigameDeck,
  onWin,
}: UseFillBlanksGameProps) {
  const level = minigameDeck?.level || "N5";
  const isFuriganaSupported = level === "N5" || level === "N4";

  // --- Game States ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBlankIndex, setActiveBlankIndex] = useState(0);
  const [filledAnswers, setFilledAnswers] = useState<Record<number, string>>({});
  const [shibaHp, setShibaHp] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "win" | "lose">("playing");
  const [showFurigana, setShowFurigana] = useState(isFuriganaSupported);

  // Hint states
  const [showShibaMaster, setShowShibaMaster] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<Record<number, boolean>>({});

  // Options state
  const [options, setOptions] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, boolean>>({});

  // Tooltip dictionary state
  const [activeHoverWord, setActiveHoverWord] = useState<any | null>(null);

  // Timer running state (false for first-time tutorial)
  const [isRunning, setIsRunning] = useState(false);

  const quiz = quizList[currentIndex];

  // Dynamic Time Limit calculation
  const totalTimeLimit = useMemo(() => {
    if (!quizList || quizList.length === 0) return 90;
    const calculatedTime = quizList.reduce((acc, q) => {
      const cleanText = q.sentence.replace(/\[([^\]]+)\]\{[^\}]+\}/g, "$1");
      const sentenceLength = cleanText.length;
      const blanksCount = q.blanks?.length || 1;
      const sentenceTime = 6 + sentenceLength * 0.4 + blanksCount * 7;
      return acc + sentenceTime;
    }, 0);
    return Math.ceil(calculatedTime) + 15;
  }, [quizList]);

  const [timeLeft, setTimeLeft] = useState(totalTimeLimit);

  // Refs for callbacks
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  }, [onWin]);

  // Sync timeLeft when totalTimeLimit changes
  useEffect(() => {
    setTimeLeft(totalTimeLimit);
  }, [totalTimeLimit]);

  // Sync default Furigana toggle based on level
  useEffect(() => {
    setShowFurigana(isFuriganaSupported);
  }, [isFuriganaSupported]);

  // Check tutorial seen and set initial timer running
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("fillblanks_tutorial_seen") === "true";
      if (hasSeen) {
        setIsRunning(true);
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (isGameOver || gameStatus !== "playing" || !isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus("lose");
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, gameStatus, isRunning]);

  // Shuffle options for the current blank
  const currentBlank = quiz?.blanks?.[activeBlankIndex];
  useEffect(() => {
    if (!currentBlank) return;
    const allOptions = [
      currentBlank.correctAnswer,
      ...currentBlank.wrongAnswers,
    ];

    const shuffled = [...allOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setOptions(shuffled);
    setWrongAttempts({});
  }, [currentIndex, activeBlankIndex, quiz, currentBlank]);

  // --- Handlers ---
  const startTimer = useCallback(() => setIsRunning(true), []);
  const pauseTimer = useCallback(() => setIsRunning(false), []);

  const handleRestartGame = useCallback(() => {
    setCurrentIndex(0);
    setActiveBlankIndex(0);
    setFilledAnswers({});
    setShibaHp(3);
    setTimeLeft(totalTimeLimit);
    setIsGameOver(false);
    setGameStatus("playing");
    setUnlockedHints({});
    setWrongAttempts({});
    setIsRunning(true);

    const firstQuiz = quizList[0];
    const firstBlank = firstQuiz?.blanks?.[0];
    if (firstBlank) {
      const allOptions = [firstBlank.correctAnswer, ...firstBlank.wrongAnswers];
      const shuffled = [...allOptions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setOptions(shuffled);
    }
  }, [quizList, totalTimeLimit]);

  const handleOptionClick = (option: string) => {
    if (!currentBlank || isGameOver || gameStatus !== "playing") return;
    if (wrongAttempts[option]) return;

    if (option === currentBlank.correctAnswer) {
      setFilledAnswers((prev) => ({ ...prev, [activeBlankIndex]: option }));
      playSFX("success");

      if (activeBlankIndex < quiz.blanks.length - 1) {
        setActiveBlankIndex((prev) => prev + 1);
      } else {
        const cleanSentence = quiz.sentence
          .replace(/\[([^\]]+)\]\{[^\}]+\}/g, "$1")
          .replace(/\{[0-9]+\}/g, (match) => {
            const idx = parseInt(match.replace(/\{|\}/g, ""));
            return { ...filledAnswers, [activeBlankIndex]: option }[idx] || option;
          });

        let transitioned = false;
        const transition = () => {
          if (transitioned) return;
          transitioned = true;
          if (currentIndex < quizList.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setActiveBlankIndex(0);
            setFilledAnswers({});
            setUnlockedHints({});
          } else {
            setGameStatus("win");
            setIsGameOver(true);
            onWinRef.current();
          }
        };

        playAudio(cleanSentence, "ja-JP", () => {
          setTimeout(transition, 200);
        });
      }
    } else {
      playSFX("fail");
      setWrongAttempts((prev) => ({ ...prev, [option]: true }));
      setShibaHp((prev) => {
        const nextHp = prev - 1;
        if (nextHp <= 0) {
          setGameStatus("lose");
          setIsGameOver(true);
        }
        return nextHp;
      });
    }
  };

  const progressPercent = (timeLeft / totalTimeLimit) * 100;

  return {
    currentIndex,
    activeBlankIndex,
    filledAnswers,
    shibaHp,
    isGameOver,
    gameStatus,
    showFurigana,
    showShibaMaster,
    unlockedHints,
    options,
    wrongAttempts,
    activeHoverWord,
    timeLeft,
    isRunning,
    progressPercent,
    totalTimeLimit,
    isFuriganaSupported,
    quiz,
    currentBlank,
    setCurrentIndex,
    setActiveBlankIndex,
    setFilledAnswers,
    setShibaHp,
    setIsGameOver,
    setGameStatus,
    setShowFurigana,
    setShowShibaMaster,
    setUnlockedHints,
    setWrongAttempts,
    setActiveHoverWord,
    startTimer,
    pauseTimer,
    handleOptionClick,
    handleRestartGame,
  };
}
