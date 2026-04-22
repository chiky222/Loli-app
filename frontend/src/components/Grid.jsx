import { memo } from 'react';

const NumBtn = memo(function NumBtn({ num, ticket, isWinner, onSelect }) {
  let cls = 'num-btn';
  if (ticket) cls += ticket.paid ? ' paid' : ' unpaid';
  if (isWinner) cls += ' winner-hl';
  return (
    <button className={cls} onClick={() => onSelect(num)}>{num}</button>
  );
});

export default function Grid({ rifaData, lastWinner, onSelect }) {
  return (
    <div className="grid-wrapper">
      <p className="grid-title">Elegi un numero</p>
      <div className="grid-legend">
        <div className="legend-item"><div className="legend-box lb-free" />Libre</div>
        <div className="legend-item"><div className="legend-box lb-paid" />Pago</div>
        <div className="legend-item"><div className="legend-box lb-unpaid" />Debe</div>
      </div>
      <div className="grid">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
          <NumBtn
            key={num}
            num={num}
            ticket={rifaData[num]}
            isWinner={lastWinner?.num === num}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
