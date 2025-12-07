import LoginForm from "../components/auth/LoginForm.jsx";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-illustration">
        <img
          src="https://via.placeholder.com/600x400?text=Organisation+Management"
          alt="Organisation"
        />
      </div>
      <LoginForm />
    </div>
  );
}
