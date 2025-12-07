import { useEffect, useState } from "react";
import api from "../api/client.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";

const emptyUser = {
  name: "",
  surname: "",
  email: "",
  number: "",
  role: "User",
  organisationId: "",
  password: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrgFilter, setSelectedOrgFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyUser);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [usersRes, orgsRes] = await Promise.all([
        api.get("/users"),
        api.get("/organisations"),
      ]);
      setUsers(usersRes.data);
      setOrganisations(orgsRes.data);
    } catch (e) {
      console.error(e);
      setError("Nepavyko įkelti naudotojų.");
    } finally {
      setLoading(false);
    }
  }

  const orgOptions = organisations;
  const orgNameById = Object.fromEntries(
    organisations.map((o) => [o.id, o.name])
  );

  const filteredUsers =
    selectedOrgFilter === "all"
      ? users
      : users.filter((u) => u.organisationId === Number(selectedOrgFilter));

  function openCreateModal() {
    setEditingUser(null);
    setForm({
      ...emptyUser,
      organisationId:
        organisations.length > 0 ? String(organisations[0].id) : "",
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setForm({
      name: user.name ?? "",
      surname: user.surname ?? "",
      email: user.email ?? "",
      number: user.number ?? "",
      role: user.role ?? "User",
      organisationId: String(user.organisationId ?? ""),
      password: user.password ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyUser);
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.organisationId) {
      setError("Pasirinkite organizaciją.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      surname: form.surname,
      email: form.email,
      number: form.number,
      role: form.role,
      organisationId: Number(form.organisationId),
      password: form.password || (editingUser?.password ?? "changeme123"),
    };

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      closeModal();
      await loadData();
    } catch (e) {
      console.error(e);
      setError("Nepavyko išsaugoti naudotojo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user) {
    if (
      !window.confirm(
        `Ar tikrai norite ištrinti naudotoją „${user.name} ${user.surname}“?`
      )
    )
      return;

    try {
      await api.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      console.error(e);
      alert("Nepavyko ištrinti naudotojo.");
    }
  }

  return (
    <div className="card">
      <div className="card-header card-header-inline">
        <h2>Users</h2>
        <div className="card-header-actions">
          <select
            className="input"
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
          >
            <option value="all">All organisations</option>
            {orgOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <Button onClick={openCreateModal}>+ New user</Button>
        </div>
      </div>

      <div className="card-body">
        {loading && <div>Loading users...</div>}
        {error && <div className="form-error">{error}</div>}

        {!loading && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Role</th>
                <th>Organisation</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.surname}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{orgNameById[u.organisationId] ?? "-"}</td>
                  <td>{u.number}</td>
                  <td className="table-actions">
                    <Button
                      variant="secondary"
                      className="mr-8"
                      onClick={() => openEditModal(u)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(u)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingUser ? "Edit user" : "New user"}
      >
        <form className="form-grid" onSubmit={handleSaveUser}>
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
            Surname
            <input
              type="text"
              required
              value={form.surname}
              onChange={(e) => setForm({ ...form, surname: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone number
            <input
              type="tel"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <label>
            Organisation
            <select
              required
              value={form.organisationId}
              onChange={(e) =>
                setForm({ ...form, organisationId: e.target.value })
              }
            >
              <option value="">-- choose --</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder={
                editingUser ? "(leave empty to keep current)" : "Password"
              }
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
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
