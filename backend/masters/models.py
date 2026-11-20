from django.db import models

# Create your models here.
from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    gst_number = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Vendor(models.Model):
    name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    class ProductType(models.TextChoices):
        FINISHED = "FINISHED", "Finished Product"
        RAW = "RAW", "Raw Material"

    sku = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=150)
    product_type = models.CharField(max_length=10, choices=ProductType.choices)
    unit = models.CharField(max_length=20, default="pcs")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vendor = models.ForeignKey(
        Vendor, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="products",
    )

    def __str__(self):
        return f"{self.sku} - {self.name}"


class ProductComponent(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="components",
        limit_choices_to={"product_type": "FINISHED"},
    )
    component = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="used_in",
        limit_choices_to={"product_type": "RAW"},
    )
    qty_per_unit = models.DecimalField(max_digits=10, decimal_places=3)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "component"], name="unique_product_component"
            )
        ]

    def __str__(self):
        return f"{self.product.name} needs {self.qty_per_unit} x {self.component.name}"