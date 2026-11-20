from django.db import models

# Create your models here.
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone

from masters.models import Customer, Product


class SalesOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        CONFIRMED = "CONFIRMED", "Confirmed"
        IN_PRODUCTION = "IN_PRODUCTION", "In Production"
        DISPATCHED = "DISPATCHED", "Dispatched"
        INVOICED = "INVOICED", "Invoiced"
        CLOSED = "CLOSED", "Closed"
        CANCELLED = "CANCELLED", "Cancelled"

    order_no = models.CharField(
        max_length=20, unique=True, null=True, blank=True, editable=False
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="orders"
    )
    order_date = models.DateField(default=timezone.localdate)
    delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="sales_orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.order_no:
            self.order_no = f"SO-{self.pk:05d}"
            super().save(update_fields=["order_no"])

    @property
    def total_amount(self):
        return sum((item.line_total for item in self.items.all()), Decimal("0"))

    def __str__(self):
        return f"{self.order_no} - {self.customer.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        SalesOrder, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="order_items",
        limit_choices_to={"product_type": "FINISHED"},
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["order", "product"], name="unique_product_per_order"
            )
        ]

    def save(self, *args, **kwargs):
        if self.unit_price is None:
            self.unit_price = self.product.price
        super().save(*args, **kwargs)

    @property
    def line_total(self):
        price = self.unit_price or Decimal("0")
        qty = self.quantity or 0
        return price * qty

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"