import { Navigate, useParams } from "react-router-dom";
import { isUuid } from "@/lib/bookingApi";

/** Legacy route — arahkan ke alur booking/chat nyata */
export default function JasaCurhatAnonimChat() {
  const { listenerId } = useParams<{ listenerId: string }>();

  if (listenerId && isUuid(listenerId)) {
    return (
      <Navigate to={`/jasa-curhat/pesan/anonim/${listenerId}`} replace />
    );
  }

  return <Navigate to="/jasa-curhat/anonim" replace />;
}
