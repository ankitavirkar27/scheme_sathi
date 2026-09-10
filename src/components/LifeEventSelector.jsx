import { LIFE_EVENT_OPTIONS } from "../data/lifeEvents";

function LifeEventSelector({ selectedEvent, freeTextGoal, onSelectEvent, onGoalChange, onSubmit, loading }) {
  return <div className="life-event-selector">
    <h2>What describes your current situation?</h2>
    <p>Choose the option closest to your situation. You can add a goal for a more relevant explanation.</p>
    <div className="life-event-options">
      {LIFE_EVENT_OPTIONS.map((event) => <button key={event.id} type="button" className={`life-event-option ${selectedEvent === event.id ? "selected" : ""}`} onClick={() => onSelectEvent(event.id)} aria-pressed={selectedEvent === event.id}>{event.label}</button>)}
    </div>
    <div className="form-group"><label htmlFor="life-event-goal">Your goal (optional)</label><input id="life-event-goal" type="text" value={freeTextGoal} onChange={(event) => onGoalChange(event.target.value)} placeholder="e.g. start a tailoring business" /></div>
    <button type="button" className="primary-button full" onClick={onSubmit} disabled={!selectedEvent || loading}>{loading ? "Finding support options..." : "Find my support path"}</button>
  </div>;
}

export default LifeEventSelector;
