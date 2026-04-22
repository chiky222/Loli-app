import { useEffect, useRef } from 'react';

const COLORS = ['#FF4FA7', '#9B5DE5', '#FFE14D', '#00C9B1', '#FF8C42'];

export default function Confetti() {
  const ref = useRef();

  useEffect(() => {
    const c = ref.current;
    for (let i = 0; i < 25; i++) {
      const s = document.createElement('span');
      const sz = 5 + Math.random() * 8;
      s.style.cssText = `
        position:absolute;border-radius:${Math.random() > .5 ? '50%' : '2px'};
        animation:fall linear infinite;opacity:.6;
        left:${Math.random() * 100}vw;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-duration:${4 + Math.random() * 6}s;
        animation-delay:${Math.random() * 8}s;
        width:${sz}px;height:${sz}px;
      `;
      c.appendChild(s);
    }
  }, []);

  return <div ref={ref} className="confetti-bg" />;
}
