import OrganisationList from "../components/organisations/OrganisationList.jsx";

export default function DashboardPage() {
  return (
    <div className="grid-2">
      <div className="grid-col">
        <OrganisationList />
      </div>
      <div className="grid-col">
        <div className="card">
          <div className="card-header">
            <h2>Welcome</h2>
          </div>
          <div className="card-body">
            <p>
              Čia galite valdyti organizacijas, naudotojus ir renginius. UI yra
              responsive, su hamburger meniu ir modaliais langais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
