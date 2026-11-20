import CrudPage from "../components/CrudPage";

const fields = [
  { name: "sku", label: "SKU", required: true },
  { name: "name", label: "Name", required: true },
  {
    name: "product_type", label: "Type", type: "choice", default: "RAW",
    choices: [["RAW", "Raw Material"], ["FINISHED", "Finished Product"]],
  },
  { name: "unit", label: "Unit", default: "pcs" },
  { name: "price", label: "Price", type: "number", required: true },
  { name: "stock_qty", label: "Stock Qty", type: "number", default: 0 },
  { name: "vendor", label: "Vendor", type: "select", optionsFrom: "/masters/vendors/" },
];

const columns = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Name" },
  { key: "product_type", label: "Type" },
  { key: "price", label: "Price" },
  { key: "stock_qty", label: "Stock" },
  { key: "vendor_name", label: "Vendor" },
  {
    key: "components", label: "Recipe",
    render: (r) =>
      r.components?.length
        ? r.components.map((c) => `${c.component_name} x${Number(c.qty_per_unit)}`).join(", ")
        : "-",
  },
];

export default function Products() {
  return (
    <CrudPage title="Products" module="products"
      endpoint="/masters/products/" columns={columns} fields={fields} />
  );
}
