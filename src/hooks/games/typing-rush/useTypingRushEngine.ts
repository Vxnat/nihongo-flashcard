import { useRef, useState, useCallback, useEffect } from "react";

export interface EnemyWord {
  id: string;
  text: string;
  romaji: string;
  x: number; // Tọa độ X (theo % chiều rộng màn hình)
  y: number; // Tọa độ Y (theo % chiều cao màn hình)
  speed: number; // Tốc độ rơi (% màn hình / giây)
}

interface UseEngineProps {
  vocabularyList: { text: string; romaji: string }[];
  onEnemyEscape: () => void; // Callback để rung màn hình khi quái lọt xuống dung nham
  initialHp?: number;
  baseSpeed?: number;
  spawnInterval?: number;
  gameDuration?: number; // Thời gian sống sót (giây)
}

export const useTypingRushEngine = ({
  vocabularyList,
  onEnemyEscape,
  initialHp = 3,
  baseSpeed = 8, // Quái rơi mất khoảng ~12.5 giây để chạm đáy
  spawnInterval = 2000, // 2 giây sinh 1 quái mới
  gameDuration = 60,
}: UseEngineProps) => {
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameOver" | "won">("idle");
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(initialHp);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(gameDuration);

  // State phụ để ép Component (chứa danh sách thẻ) re-render khi số lượng quái thay đổi.
  // Tọa độ Y thay đổi liên tục sẽ KHÔNG làm thay đổi state này để tối ưu hiệu năng.
  const [tick, setTick] = useState(0);

  // Dùng ref để lưu trữ mảng kẻ địch đang rơi
  const enemiesRef = useRef<EnemyWord[]>([]);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const spawnEnemy = useCallback(
    (timestamp: number) => {
      if (!vocabularyList || vocabularyList.length === 0) return;

      // Đã đến lúc sinh quái mới chưa?
      if (timestamp - lastSpawnTimeRef.current > spawnInterval) {
        const randomWord = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
        const newEnemy: EnemyWord = {
          id: Math.random().toString(36).substring(2, 9),
          text: randomWord.text,
          romaji: randomWord.romaji.toLowerCase(),
          x: 15 + Math.random() * 70, // Tâm x random từ 15% đến 85% để không vướng lề 2 bên
          y: 0, // Xuất phát từ trên cùng
          speed: baseSpeed + Math.random() * 5, // Thêm chút ngẫu nhiên vào tốc độ
        };

        enemiesRef.current.push(newEnemy);
        lastSpawnTimeRef.current = timestamp;
        setTick((t) => t + 1); // Báo cho UI biết vừa có quái mới
      }
    },
    [vocabularyList, spawnInterval, baseSpeed]
  );

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (gameState === "playing") {
        const elapsed = timestamp - startTimeRef.current;
        const currentRemaining = Math.max(0, gameDuration - Math.floor(elapsed / 1000));

        setTimeLeft((prev) => {
          if (prev !== currentRemaining) {
            if (currentRemaining === 0) {
              setGameState((g) => (g === "playing" ? "won" : g));
            }
            return currentRemaining;
          }
          return prev;
        });

        if (currentRemaining === 0) return; // Hết giờ thì ngưng không sinh quái hay rớt thêm

        spawnEnemy(timestamp);

        // Cập nhật tọa độ Y của tất cả quái vật
        let hasEscaped = false;
        enemiesRef.current = enemiesRef.current.filter((enemy) => {
          enemy.y += (enemy.speed * deltaTime) / 1000;

           // Cập nhật giao diện DOM trực tiếp để tối ưu 60FPS (Bypass React render)
          const el = document.getElementById(`enemy-${enemy.id}`);
          if (el) {
            el.style.transform = `translate(calc(${enemy.x}vw - 50%), ${enemy.y}vh)`;
          }

          if (enemy.y > 100) {
            hasEscaped = true;
            return false; // Rớt xuống dung nham -> Xóa khỏi mảng
          }
          return true; // Tiếp tục rơi
        });

        if (hasEscaped) {
          setHp((prev) => {
            const nextHp = prev - 1;
            if (nextHp <= 0) setGameState("gameOver");
            return nextHp;
          });
          onEnemyEscape();
          setTick((t) => t + 1); // Báo cho UI update vì mảng bị mất 1 phần tử
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [gameState, spawnEnemy, onEnemyEscape]
  );

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setHp(initialHp);
    setUserInput("");
    enemiesRef.current = [];
    lastTimeRef.current = performance.now();
    lastSpawnTimeRef.current = performance.now();
    startTimeRef.current = performance.now();
    setTimeLeft(gameDuration);
    setTick(0);
  };

  const destroyEnemy = (id: string) => {
    enemiesRef.current = enemiesRef.current.filter((e) => e.id !== id);
    setScore((s) => s + 10);
    setTick((t) => t + 1);
  };

  return {
    gameState,
    score,
    hp,
    userInput,
    timeLeft,
    setUserInput,
    enemiesRef, // Xuất Ref ra cho Component render
    tick,       // Xuất biến tick để component con dùng làm dependency
    startGame,
    destroyEnemy,
  };
};