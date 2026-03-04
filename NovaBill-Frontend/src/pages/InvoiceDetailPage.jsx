import InvoiceForm from "../components/InvoiceForm";
import { useParams, useNavigate } from "react-router-dom";

export default function InvoiceDetailPage({ mode }) {
  const { id } = useParams();
  // Pass mode and id to InvoiceForm
  return (
    <div className="p-8">
      <InvoiceForm mode={mode} invoiceId={id} />
    </div>
  );
} 