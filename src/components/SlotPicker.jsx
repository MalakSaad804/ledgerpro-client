export default function SlotPicker({ slots, value, onChange }) {
  const open = slots.filter((s) => s.available).length;

  if (slots.length === 0) {
    return <p className="muted">No working hours are set for this day. Try another date.</p>;
  }
  return (
    <div>
      <p className="muted">{open} of {slots.length} slots open</p>
      <div className="slot-grid" role="radiogroup" aria-label="Available time slots">
        {slots.map((s) => (
          <button
            key={s.start}
            type="button"
            role="radio"
            aria-checked={value === s.start}
            disabled={!s.available}
            className={`slot ${value === s.start ? 'slot-selected' : ''}`}
            onClick={() => onChange(s.start)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
