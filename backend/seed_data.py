import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from masters.models import Customer, Vendor, Product, ProductComponent

# ---------- Vendors ----------
vendors_data = [
    ("Wood Suppliers", "Ramesh Gupta", "wood@example.com", "9811111111"),
    ("Metro Hardware", "Sunil Verma", "metro@example.com", "9822222222"),
    ("Foam & Fabrics Co", "Anita Sharma", "foam@example.com", "9833333333"),
]
vendors = {}
for name, contact, email, phone in vendors_data:
    v, _ = Vendor.objects.get_or_create(
        email=email,
        defaults={"name": name, "contact_person": contact, "phone": phone,
                  "address": "Ghaziabad, UP"},
    )
    vendors[name] = v

# ---------- Customers ----------
customers_data = [
    ("Sharma Offices Pvt Ltd", "sharma@example.com", "8888888888", "Ghaziabad, UP"),
    ("Gupta Interiors", "gupta@example.com", "8877777777", "Noida, UP"),
    ("Verma Furniture Mart", "verma@example.com", "8866666666", "Delhi"),
    ("Singh Enterprises", "singh@example.com", "8855555555", "Meerut, UP"),
    ("Khan Home Decor", "khan@example.com", "8844444444", "Lucknow, UP"),
]
for name, email, phone, addr in customers_data:
    Customer.objects.get_or_create(
        email=email,
        defaults={"name": name, "phone": phone, "address": addr},
    )

# ---------- Raw materials ----------
raw_data = [
    ("RM-LEG", "Chair Leg", 50, 100, "Wood Suppliers"),
    ("RM-SEAT", "Chair Seat", 300, 50, "Wood Suppliers"),
    ("RM-SCREW", "Screw", 2, 500, "Metro Hardware"),
    ("RM-TOP", "Table Top", 1500, 20, "Wood Suppliers"),
    ("RM-FOAM", "Foam Sheet", 120, 80, "Foam & Fabrics Co"),
    ("RM-FABRIC", "Fabric Roll", 90, 60, "Foam & Fabrics Co"),
]
raw = {}
for sku, name, price, stock, vendor in raw_data:
    p, _ = Product.objects.get_or_create(
        sku=sku,
        defaults={"name": name, "product_type": "RAW", "unit": "pcs",
                  "price": price, "stock_qty": stock, "vendor": vendors[vendor]},
    )
    raw[sku] = p

# ---------- Finished products + recipes ----------
finished_data = [
    ("FG-CHAIR", "Office Chair", 2500,
     {"RM-LEG": 4, "RM-SEAT": 1, "RM-SCREW": 20}),
    ("FG-TABLE", "Office Table", 6500,
     {"RM-TOP": 1, "RM-LEG": 4, "RM-SCREW": 16}),
    ("FG-SOFA", "Sofa Chair", 9000,
     {"RM-FOAM": 3, "RM-FABRIC": 2, "RM-LEG": 4, "RM-SCREW": 24}),
]
for sku, name, price, recipe in finished_data:
    fp, _ = Product.objects.get_or_create(
        sku=sku,
        defaults={"name": name, "product_type": "FINISHED", "unit": "pcs",
                  "price": price, "stock_qty": 0},
    )
    for comp_sku, qty in recipe.items():
        ProductComponent.objects.get_or_create(
            product=fp, component=raw[comp_sku],
            defaults={"qty_per_unit": qty},
        )

print("Seed complete.")
print("Vendors:", Vendor.objects.count(),
      "| Customers:", Customer.objects.count(),
      "| Products:", Product.objects.count(),
      "| Recipe rows:", ProductComponent.objects.count())