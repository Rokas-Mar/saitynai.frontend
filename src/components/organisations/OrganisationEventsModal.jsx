import Modal from "../ui/Modal.jsx";

export default function OrganisationEventsModal({
  open,
  org,
  events,
  loading,
  onClose,
}) {
  return (
    <Modal open={open} onClose={onClose} title={org ? org.name : "Events"}>
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="events-list">
          {events.length === 0 ? (
            <div className="text-muted">No events for this organisation.</div>
          ) : (
            <ul>
              {events.map((e) => (
                <li key={e.id} className="event-item">
                  <div className="event-name">{e.name}</div>
                  <div className="event-meta">
                    <span>{new Date(e.date).toLocaleString()}</span>
                    <span>{e.location}</span>
                    <span>by {e.userName}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
