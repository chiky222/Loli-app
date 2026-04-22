import { useState, useRef, useEffect } from 'react';

const MEDALS = ['1ro', '2do', '3ro'];

function launchBurst() {
  const colors = ['#FF4FA7','#9B5DE5','#FFE14D','#00C9B1','#FF8C42','#fff'];
  const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'burst';
    const ang = Math.random()*360, dist = 100+Math.random()*400, sz = 6+Math.random()*12, dur = .8+Math.random()*1.2;
    el.style.cssText = `left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>.5?'50%':'3px'};`;
    document.body.appendChild(el);
    const rad = ang * Math.PI / 180;
    el.animate([
      { transform: 'translate(-50%,-50%) scale(0)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(rad)*dist}px),calc(-50% + ${Math.sin(rad)*dist}px)) scale(1) rotate(${ang*3}deg)`, opacity: 0 }
    ], { duration: dur*1000, easing: 'cubic-bezier(0,.8,.6,1)', fill: 'forwards' }).onfinish = () => el.remove();
  }
}

export default function Sorteo({ rifaData, sorteoHistory, onAddWinner, onResetSorteo, showToast, confirm }) {
  const [drumNum,  setDrumNum]  = useState('?');
  const [drumName, setDrumName] = useState('Presiona SORTEAR');
  const [spinning, setSpinning] = useState(false);
  const [running,  setRunning]  = useState(false);
  const [winner,   setWinner]   = useState(null);
  const spinRef = useRef(null);

  useEffect(() => {
    if (sorteoHistory.length) {
      const last = sorteoHistory[sorteoHistory.length - 1];
      setDrumNum(String(last.num).padStart(2, '0'));
      setDrumName(last.buyer?.name || '-');
      setWinner(last);
    }
    return () => clearTimeout(spinRef.current);
  }, []);

  function iniciarSorteo() {
    if (running) return;
    const sold = Object.keys(rifaData).map(Number);
    if (!sold.length) { showToast('No hay numeros vendidos'); return; }
    const won = sorteoHistory.map(h => h.num);
    const candidates = sold.filter(n => !won.includes(n));
    if (!candidates.length) { showToast('Todos los numeros ya fueron sorteados'); return; }

    setRunning(true);
    setWinner(null);
    setSpinning(true);
    setDrumName('Sorteando…');

    const winnerNum = candidates[Math.floor(Math.random() * candidates.length)];
    let elapsed = 0, speed = 55;
    const TOTAL = 4200;

    function tick() {
      setDrumNum(String(candidates[Math.floor(Math.random() * candidates.length)]).padStart(2, '0'));
      elapsed += speed;
      if (elapsed > TOTAL * .6)  speed = 75 + (elapsed - TOTAL * .6) / 8;
      if (elapsed > TOTAL * .85) speed = 160;
      if (elapsed >= TOTAL) revealWinner(winnerNum);
      else spinRef.current = setTimeout(tick, speed);
    }
    tick();
  }

  async function revealWinner(num) {
    setSpinning(false);
    setDrumNum(String(num).padStart(2, '0'));
    const buyer = rifaData[num];
    setDrumName(buyer?.name || '(sin datos)');
    const entry = await onAddWinner(num, buyer);
    setWinner(entry);
    launchBurst();
    setRunning(false);
    showToast('Gano el #' + String(num).padStart(2, '0') + (buyer ? ' - ' + buyer.name : ''));
  }

  async function handleReset() {
    if (running) return;
    const ok = await confirm('Reiniciar historial de sorteos', 'Se borrará el historial completo. Los números vendidos no se tocan.', '🎲');
    if (!ok) return;
    await onResetSorteo();
    setWinner(null);
    setDrumNum('?');
    setDrumName('Presiona SORTEAR');
    showToast('Historial reiniciado');
  }

  return (
    <div className="sorteo-container">
      <div className="sorteo-title">SORTEO EN VIVO</div>
      <p className="sorteo-sub">Compartí esta pantalla y sortea en tiempo real</p>

      {winner && (
        <div className="winner-panel show">
          <span className="winner-crown">👑</span>
          <div className="winner-label">GANADOR</div>
          <div className="winner-num-big">#{String(winner.num).padStart(2, '0')}</div>
          <div className="winner-name-big">{winner.buyer?.name || 'Sin nombre'}</div>
          <div className="winner-detail">{winner.buyer?.phone || winner.buyer?.note || ''}</div>
        </div>
      )}

      <div className="drum-wrapper">
        <div className="drum-ring" />
        <div className="drum-ring2" />
        <div className="drum-circle">
          <div className="drum-label">Numero</div>
          <div className={`drum-number${spinning ? ' spinning' : ''}`}>{drumNum}</div>
          <div className="drum-name">{drumName}</div>
        </div>
      </div>

      <div className="sorteo-btns">
        <button className="btn-sortear" disabled={running} onClick={iniciarSorteo}>SORTEAR</button>
        <button className="btn-reset" onClick={handleReset}>Reiniciar</button>
      </div>

      <div className="history-card">
        <div className="history-title">Historial de Sorteos</div>
        <div className="history-list">
          {sorteoHistory.length === 0
            ? <div className="history-empty">El historial aparece aca despues de cada sorteo.</div>
            : sorteoHistory.map((h, i) => (
              <div key={i} className="history-item">
                <span className="history-pos">{MEDALS[i] || `#${i + 1}`}</span>
                <div className="history-num-b">{h.num}</div>
                <div className="history-info">
                  <div className="history-name">{h.buyer?.name || '(sin datos)'}</div>
                  <div className="history-meta">{h.buyer?.phone ? h.buyer.phone + ' - ' : ''}{h.date}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
