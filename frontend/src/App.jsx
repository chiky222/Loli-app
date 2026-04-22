import { useState, useEffect } from 'react';
import { useRifa }       from './hooks/useRifa';
import { useConfirm }    from './hooks/useConfirm';
import Confetti          from './components/Confetti';
import Toast             from './components/Toast';
import ConfirmModal      from './components/ConfirmModal';
import Stats             from './components/Stats';
import Grid              from './components/Grid';
import SoldList          from './components/SoldList';
import Debtors           from './components/Debtors';
import TicketModal       from './components/TicketModal';
import Sorteo            from './components/Sorteo';

export default function App() {
  const [tab, setTab]                 = useState('gestion');
  const [selectedNum, setSelectedNum] = useState(null);

  const {
    rifaData, sorteoHistory, lastWinner,
    toast, showToast,
    loadAll, saveTicket, releaseTicket, togglePay,
    addSorteoWinner, resetSorteo, resetApp,
  } = useRifa();

  const { confirm, confirmState, respond } = useConfirm();

  useEffect(() => { loadAll(); }, []);

  async function handleReset() {
    const ok = await confirm(
      'Reiniciar toda la rifa',
      'Se borrarán todos los números vendidos y el historial de sorteos. Esta acción no se puede deshacer.',
      '🗑️'
    );
    if (!ok) return;
    await resetApp();
    showToast('Rifa reiniciada — todos los números disponibles');
  }

  async function handleTogglePay(num) {
    const paid = await togglePay(num);
    const b = rifaData[num];
    if (b) showToast(b.name + (paid ? ' - pago' : ' - pendiente'));
    return paid;
  }

  return (
    <>
      <Confetti />

      <div className="tabs">
        <button className={`tab-btn${tab === 'gestion' ? ' active' : ''}`} onClick={() => setTab('gestion')}>Gestión</button>
        <button className={`tab-btn${tab === 'sorteo'  ? ' active' : ''}`} onClick={() => setTab('sorteo')}>Sorteo en Vivo</button>
      </div>

      {tab === 'gestion' && (
        <div className="container">
          <header>
            <span className="emoji-banner">🎟️</span>
            <h1>MI RIFA</h1>
            <p className="subtitle">Elegí tu número de la suerte!</p>
          </header>
          <Stats rifaData={rifaData} onReset={handleReset} />
          <Grid rifaData={rifaData} lastWinner={lastWinner} onSelect={setSelectedNum} />
          <SoldList rifaData={rifaData} onSelect={setSelectedNum} onTogglePay={handleTogglePay} />
          <Debtors  rifaData={rifaData} onTogglePay={handleTogglePay} />
        </div>
      )}

      {tab === 'sorteo' && (
        <Sorteo
          rifaData={rifaData}
          sorteoHistory={sorteoHistory}
          onAddWinner={addSorteoWinner}
          onResetSorteo={resetSorteo}
          showToast={showToast}
          confirm={confirm}
        />
      )}

      {selectedNum !== null && (
        <TicketModal
          num={selectedNum}
          ticket={rifaData[selectedNum]}
          onClose={() => setSelectedNum(null)}
          onSave={async (num, body) => { await saveTicket(num, body); showToast(`Nro ${String(num).padStart(2,'0')} vendido a ${body.name}`); }}
          onRelease={releaseTicket}
          onTogglePay={handleTogglePay}
          confirm={confirm}
        />
      )}

      <ConfirmModal
        open={confirmState.open}
        icon={confirmState.icon}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Confirmar"
        confirmDanger
        onConfirm={() => respond(true)}
        onCancel={() => respond(false)}
      />

      <Toast msg={toast.msg} show={toast.show} />
    </>
  );
}
