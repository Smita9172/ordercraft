from django.db import models

# Create your models here.
from decimal import Decimal

from django.db import models

from masters.models import Product
from sales.models import SalesOrder


class BOM(models.Model):
    bom_no = models.CharField(
        max_length=20, unique=True, null=True, blank=True, editable=False
    )
    order = models.OneToOneField(
        SalesOrder, on_delete=models.CASCADE, related_name="bom"
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-generated_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.bom_no:
            self.bom_no = f"BOM-{self.pk:05d}"
            super().save(update_fields=["bom_no"])

    def __str__(self):
        return f"{self.bom_no} for {self.order.order_no}"


class BOMItem(models.Model):
    bom = models.ForeignKey(BOM, on_delete=models.CASCADE, related_name="items")
    component = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="bom_items",
        limit_choices_to={"product_type": "RAW"},
    )
    required_qty = models.DecimalField(max_digits=12, decimal_places=3)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["bom", "component"], name="unique_component_per_bom"
            )
        ]

    @property
    def available_qty(self):
        return self.component.stock_qty

    @property
    def shortage_qty(self):
        diff = self.required_qty - self.component.stock_qty
        return diff if diff > 0 else Decimal("0")

    def __str__(self):
        return f"{self.component.name}: {self.required_qty}"