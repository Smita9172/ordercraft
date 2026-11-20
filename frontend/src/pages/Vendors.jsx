import CrudPage from "../components/CrudPage";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "contact_person", label: "Contact Person" },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", required: true },
  { name: "address", label: "Address" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "contact_person", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

export default function Vendors() {
  return (
    <CrudPage title="Vendors" module="vendors"
      endpoint="/masters/vendors/" columns={columns} fields={fields} />
  );
}