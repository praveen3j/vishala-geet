export default function EmptyState({ actionText, onAction, text, title }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <p>{text}</p>
      <button className="primary" type="button" onClick={onAction}>
        {actionText}
      </button>
    </div>
  );
}
