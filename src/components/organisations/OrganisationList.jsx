import { useEffect, useState } from "react";
import api from "../../api/client.js";
import OrganisationEventsModal from "./OrganisationEventsModal.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import { useNavigate } from "react-router-dom";

const emptyOrganisation = {
  name: "",
  email: "",
  address: "",
  postalCode: "",
  iban: "",
  number: "",
  companyCode: "",
};

export default function OrganisationList() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [form, setForm] = useState(emptyOrganisation);

  const navigate = useNavigate();

  useEffect(() => {
    loadOrganisations();
  }, []);

  async function loadOrganisations() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/organisations");
      setOrgs(res.data);
    } catch (e) {
      console.error(e);
      setError("Nepavyko įkelti organizacijų.");
    } finally {
      setLoading(false);
    }
  }

  async function openEvents(org) {
    setSelectedOrg(org);
    setLoadingEvents(true);
    setEvents([]);
    try {
      const res = await api.get(`/organisations/${org.id}/events`);
      const flatEvents =
        res.data.users?.flatMap((u) =>
          u.events.map((e) => ({
            ...e,
            userName: `${u.name} ${u.surname}`,
          }))
        ) ?? [];
      setEvents(flatEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEvents(false);
    }
  }

  function closeEventsModal() {
    setSelectedOrg(null);
    setEvents([]);
  }

  function openCreateModal() {
    setEditingOrg(null);
    setForm(emptyOrganisation);
    setError("");
    setOrgModalOpen(true);
  }

  function openEditModal(org) {
    setEditingOrg(org);
    setForm({
      name: org.name ?? "",
      email: org.email ?? "",
      address: org.address ?? "",
      postalCode: org.postalCode ?? "",
      iban: org.iban ?? "",
      number: org.number ?? "",
      companyCode: org.companyCode ?? "",
    });
    setError("");
    setOrgModalOpen(true);
  }

  function closeOrgModal() {
    setOrgModalOpen(false);
    setEditingOrg(null);
    setForm(emptyOrganisation);
  }

  async function handleSaveOrganisation(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      email: form.email,
      address: form.address,
      postalCode: form.postalCode,
      iban: form.iban,
      number: form.number,
      companyCode: form.companyCode,
    };

    try {
      if (editingOrg) {
        await api.put(`/organisations/${editingOrg.id}`, payload);
      } else {
        await api.post("/organisations", payload);
      }
      closeOrgModal();
      await loadOrganisations();
    } catch (e) {
      console.error(e);
      setError("Nepavyko išsaugoti organizacijos.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOrganisation(org) {
    if (
      !window.confirm(`Ar tikrai norite ištrinti organizaciją „${org.name}“?`)
    )
      return;

    try {
      await api.delete(`/organisations/${org.id}`);
      setOrgs((prev) => prev.filter((o) => o.id !== org.id));
    } catch (e) {
      console.error(e);
      alert("Nepavyko ištrinti organizacijos.");
    }
  }

  return (
    <>
      <div className="card organisations-card">
        <div className="card-header card-header-inline">
          <h2>Organisations</h2>
          <Button onClick={openCreateModal}>+ New organisation</Button>
        </div>

        <div className="card-body">
          {loading && <div>Loading organisations...</div>}
          {error && <div className="form-error">{error}</div>}

          {!loading && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Number</th>
                  <th>Company code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id}>
                    <td data-label="Name">{org.name}</td>
                    <td data-label="Email">{org.email}</td>
                    <td data-label="Number">{org.number}</td>
                    <td data-label="Company code">{org.companyCode}</td>
                    <td className="table-actions" data-label="Actions">
                      <Button
                        variant="secondary"
                        className="mr-8"
                        onClick={() => openEvents(org)}
                      >
                        Events
                      </Button>
                      <Button
                        variant="secondary"
                        className="mr-8"
                        onClick={() => openEditModal(org)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteOrganisation(org)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="secondary"
                        className="mr-8"
                        onClick={() => navigate(`/organisations/${org.id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}

                {orgs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="text-muted">
                      No organisations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        open={orgModalOpen}
        onClose={closeOrgModal}
        title={editingOrg ? "Edit organisation" : "New organisation"}
      >
        <form className="form-grid" onSubmit={handleSaveOrganisation}>
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
            Address
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label>
            Postal code
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
          </label>
          <label>
            Company code
            <input
              type="text"
              value={form.companyCode}
              onChange={(e) =>
                setForm({ ...form, companyCode: e.target.value })
              }
            />
          </label>
          <label>
            IBAN
            <input
              type="text"
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeOrgModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <OrganisationEventsModal
        open={!!selectedOrg}
        org={selectedOrg}
        events={events}
        loading={loadingEvents}
        onClose={closeEventsModal}
      />
    </>
  );
}
