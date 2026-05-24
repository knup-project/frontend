'use client';

import { useEffect, useRef } from 'react';

interface ActiveQuestion {
  startedAt: number;
  timeLimit: number;
}

/**
 * 문제 카운트다운 타이머 훅
 *
 * activeQuestion이 세팅되면 타이머를 시작하고,
 * 시간이 다 되면 onTimeout을 호출합니다.
 *
 * timeLeft 상태는 호출부에서 직접 관리합니다 (setTimeLeft 주입).
 * 이렇게 하면 useEffect 내 setState 규칙을 준수하면서도
 * 타이머 로직을 깔끔하게 분리할 수 있습니다.
 *
 * @example
 * const [timeLeft, setTimeLeft] = useState(0);
 * useQuestionTimer({ activeQuestion, setTimeLeft, onTimeout: () => setPhase('submitted') });
 */
export function useQuestionTimer({
  activeQuestion,
  setTimeLeft,
  onTimeout,
}: {
  activeQuestion: ActiveQuestion | null;
  setTimeLeft: (updater: (prev: number) => number) => void;
  onTimeout: () => void;
}): void {
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (!activeQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // activeQuestion 참조가 바뀔 때마다(새 문제마다) 타이머 재시작
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion]);
}
