import { useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";

const emptyEvent = {
  name: "",
  date: "",
  location: "",
  userId: "",
};

function toInputDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedUserFilter, setSelectedUserFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    ...emptyEvent,
    date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [evRes, usersRes] = await Promise.all([
        api.get("/events"),
        api.get("/users"),
      ]);
      setEvents(evRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      console.error(e);
      setError("Nepavyko įkelti renginių.");
    } finally {
      setLoading(false);
    }
  }

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  const filteredEvents =
    selectedUserFilter === "all"
      ? events
      : events.filter((e) => e.userId === Number(selectedUserFilter));

  function openCreateModal() {
    setEditingEvent(null);
    setForm({
      ...emptyEvent,
      date: new Date().toISOString().slice(0, 16),
      userId: users.length > 0 ? String(users[0].id) : "",
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(evt) {
    setEditingEvent(evt);
    setForm({
      name: evt.name ?? "",
      date: toInputDateTime(evt.date),
      location: evt.location ?? "",
      userId: String(evt.userId ?? ""),
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEvent(null);
    setForm(emptyEvent);
  }

  async function handleSaveEvent(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.userId) {
      setError("Pasirinkite naudotoją.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      date: form.date,
      location: form.location,
      userId: Number(form.userId),
    };

    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      closeModal();
      await loadData();
    } catch (e) {
      console.error(e);
      setError("Nepavyko išsaugoti renginio.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent(evt) {
    if (!window.confirm(`Ar tikrai norite ištrinti renginį „${evt.name}“?`))
      return;

    try {
      await api.delete(`/events/${evt.id}`);
      setEvents((prev) => prev.filter((e) => e.id !== evt.id));
    } catch (e) {
      console.error(e);
      alert("Nepavyko ištrinti renginio.");
    }
  }

  return (
    <div className="card">
      <div className="card-header card-header-inline">
        <h2>Events</h2>
        <div className="card-header-actions">
          <select
            className="input"
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
          >
            <option value="all">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.surname}
              </option>
            ))}
          </select>
          <Button onClick={openCreateModal}>+ New event</Button>
        </div>
      </div>

      <div className="card-body">
        {loading && <div>Loading events...</div>}
        {error && <div className="form-error">{error}</div>}

        {!loading && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date & time</th>
                  <th>Location</th>
                  <th>User</th>
                  <th>Organisation ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => {
                  const user = usersById[evt.userId];
                  return (
                    <tr key={evt.id}>
                      <td data-label="Name">{evt.name}</td>
                      <td data-label="Date & time">
                        {evt.date ? new Date(evt.date).toLocaleString() : "-"}
                      </td>
                      <td data-label="Location">{evt.location}</td>
                      <td data-label="User">
                        {user
                          ? `${user.name} ${user.surname}`
                          : `#${evt.userId}`}
                      </td>
                      <td data-label="Organisation ID">
                        {user?.organisationId ?? "-"}
                      </td>
                      <td className="table-actions" data-label="Actions">
                        <Button
                          variant="secondary"
                          className="mr-8"
                          onClick={() => openEditModal(evt)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteEvent(evt)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filteredEvents.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="text-muted">
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingEvent ? "Edit event" : "New event"}
      >
        <form className="form-grid" onSubmit={handleSaveEvent}>
          <label>
            Name
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Date & time
            <input
              type="datetime-local"
              required
              value={form.date}
              step="900"
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            Location
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label>
            User
            <select
              required
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">-- choose user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.surname}
                </option>
              ))}
            </select>
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
