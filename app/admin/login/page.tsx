import { Suspense } from "react";
import AdminLoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pattern-bg flex items-center justify-center text-text-muted">
          Loading...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
