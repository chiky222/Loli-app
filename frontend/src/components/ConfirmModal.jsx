export default function ConfirmModal({ open, icon, title, message, onConfirm, onCancel, confirmLabel = 'Confirmar', confirmDanger = false }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop open" style={{ zIndex: 150 }}>
      <div className="modal confirm-modal">
        <div className="confirm-icon">{icon}</div>
        <div className="confirm-title">{title}</div>
        {message && <div className="confirm-message">{message}</div>}
        <div className="confirm-btns">
          <button className="confirm-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className={`confirm-btn-ok${confirmDanger ? ' danger' : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
