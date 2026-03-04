import { BrowserRouter, Routes, Route } from "react-router-dom";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import ItemsPage from "./pages/ItemsPage";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<InvoiceDetailPage mode="create" />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage mode="edit" />} />
          <Route path="/items" element={<ItemsPage />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
