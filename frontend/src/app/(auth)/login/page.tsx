import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left px-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1D20]">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 font-normal leading-relaxed">
          Sign in to access your geospatial hazard forecasting workspaces and PostGIS repositories.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
