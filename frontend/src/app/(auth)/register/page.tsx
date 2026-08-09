import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left px-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1D20]">
          Create a workspace account
        </h1>
        <p className="text-sm text-slate-500 font-normal leading-relaxed">
          Register your credentials to provision a secure geospatial repository and start hazard analytics modeling.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
