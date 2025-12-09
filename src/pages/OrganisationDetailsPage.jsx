import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Button from "../components/ui/Button.jsx";

export default function OrganisationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganisation();
  }, [id]);

  async function loadOrganisation() {
    try {
      setLoading(true);

      const orgResponse = await api.get(`/organisations/${id}`);
      setOrg(orgResponse.data);

      const res = await api.get(`/organisations/${id}/events`);
      setData(res.data?.users ?? []);
    } catch (err) {
      console.error(err);
      alert("Failed to load organisation details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header card-header-inline">
        <h2>Organisation Details</h2>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {loading && <div className="card-body">Loading...</div>}

      {!loading && org && (
        <div className="card-body">
          <h3>{org.name}</h3>
          <p>
            <strong>Email:</strong> {org.email}
          </p>
          <p>
            <strong>Address:</strong> {org.address}
          </p>
          <p>
            <strong>Company Code:</strong> {org.companyCode}
          </p>
          <p>
            <strong>Phone:</strong> {org.number}
          </p>

          <hr className="mt-16 mb-16" />

          <h3>Users & Their Events</h3>

          {data.length === 0 ? (
            <p className="text-muted">
              This organisation has no users or events.
            </p>
          ) : (
            data.map((user) => (
              <div key={user.id} className="mt-12 p-12 border rounded bg-light">
                <h4>
                  👤 {user.name} {user.surname} <small>({user.email})</small>
                </h4>

                {user.events?.length > 0 ? (
                  <div className="table-scroll mt-8">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Date</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.events.map((e) => (
                          <tr key={e.id}>
                            <td data-label="Event Name">{e.name}</td>
                            <td data-label="Date">
                              {new Date(e.date).toLocaleString()}
                            </td>
                            <td data-label="Location">{e.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted mt-4">No events for this user.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
