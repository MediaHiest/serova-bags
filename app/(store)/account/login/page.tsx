import { Suspense } from "react";
import LoginPage from "./LoginForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
