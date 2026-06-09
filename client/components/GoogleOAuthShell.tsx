import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleOAuthShell({ children }: { children: ReactNode }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
