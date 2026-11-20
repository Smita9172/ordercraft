import CrudPage from "../components/CrudPage";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", required: true },
  { name: "address", label: "Address" },
  { name: "gst_number", label: "GST Number" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "gst_number", label: "GST" },
];

export default function Customers() {
  return (
    <CrudPage title="Customers" module="customers"
      endpoint="/masters/customers/" columns={columns} fields={fields} />
  );
}