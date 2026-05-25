import { Suspense } from "react";
import RegisterPage from "./RegisterForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted">Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
