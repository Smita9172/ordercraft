from django.db import models

# Create your models here.
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone

from bom.models import BOM
from masters.models import Product, Vendor


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Sent to Vendor"
        PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED", "Partially Received"
        RECEIVED = "RECEIVED", "Received"
        CANCELLED = "CANCELLED", "Cancelled"

    po_no = models.CharField(
        max_length=20, unique=True, null=True, blank=True, editable=False
    )
    vendor = models.ForeignKey(
        Vendor, on_delete=models.PROTECT, related_name="purchase_orders"
    )
    bom = models.ForeignKey(
        BOM, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="purchase_orders",
    )
    po_date = models.DateField(default=timezone.localdate)
    expected_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="purchase_orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.po_no:
            self.po_no = f"PO-{self.pk:05d}"
            super().save(update_fields=["po_no"])

    @property
    def total_amount(self):
        return sum((i.line_total for i in self.items.all()), Decimal("0"))

    def __str__(self):
        return f"{self.po_no} - {self.vendor.name}"


class POItem(models.Model):
    po = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="po_items",
        limit_choices_to={"product_type": "RAW"},
    )
    ordered_qty = models.DecimalField(max_digits=12, decimal_places=3)
    received_qty = models.DecimalField(
        max_digits=12, decimal_places=3, default=0
    )
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["po", "product"], name="unique_product_per_po"
            )
        ]

    def save(self, *args, **kwargs):
        if self.unit_price is None and self.product_id:
            self.unit_price = self.product.price
        super().save(*args, **kwargs)

    @property
    def pending_qty(self):
        return (self.ordered_qty or Decimal("0")) - (self.received_qty or Decimal("0"))

    @property
    def line_total(self):
        return (self.unit_price or Decimal("0")) * (self.ordered_qty or Decimal("0"))

    def __str__(self):
        return f"{self.product.name} x {self.ordered_qty}"