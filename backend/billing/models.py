from django.db import models

# Create your models here.
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from sales.models import SalesOrder


class Invoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    invoice_no = models.CharField(
        max_length=20, unique=True, null=True, blank=True, editable=False
    )
    order = models.OneToOneField(
        SalesOrder, on_delete=models.PROTECT, related_name="invoice"
    )
    invoice_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.UNPAID
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.invoice_no:
            self.invoice_no = f"INV-{self.pk:05d}"
            super().save(update_fields=["invoice_no"])

    @property
    def paid_amount(self):
        return self.payments.aggregate(t=Sum("amount"))["t"] or Decimal("0")

    @property
    def balance_amount(self):
        return self.total_amount - self.paid_amount

    def update_status(self):
        if self.status == self.Status.CANCELLED:
            return
        paid = self.paid_amount
        if paid >= self.total_amount:
            self.status = self.Status.PAID
        elif paid > 0:
            self.status = self.Status.PARTIAL
        else:
            self.status = self.Status.UNPAID
        self.save(update_fields=["status"])

    def __str__(self):
        return f"{self.invoice_no} - {self.order.customer.name}"


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "CASH", "Cash"
        UPI = "UPI", "UPI"
        BANK = "BANK", "Bank Transfer"
        CHEQUE = "CHEQUE", "Cheque"

    receipt_no = models.CharField(
        max_length=20, unique=True, null=True, blank=True, editable=False
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.PROTECT, related_name="payments"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(default=timezone.localdate)
    method = models.CharField(
        max_length=10, choices=Method.choices, default=Method.UPI
    )
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        if self.amount is None or not self.invoice_id:
            return
        if self.amount <= 0:
            raise ValidationError("Amount 0 se zyada hona chahiye.")
        others = (
            self.invoice.payments.exclude(pk=self.pk)
            .aggregate(t=Sum("amount"))["t"]
            or Decimal("0")
        )
        remaining = self.invoice.total_amount - others
        if self.amount > remaining:
            raise ValidationError(
                f"Amount balance se zyada hai. Baaki sirf {remaining} hai."
            )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.receipt_no:
            self.receipt_no = f"PAY-{self.pk:05d}"
            super().save(update_fields=["receipt_no"])
        self.invoice.update_status()

    def delete(self, *args, **kwargs):
        invoice = self.invoice
        super().delete(*args, **kwargs)
        invoice.update_status()

    def __str__(self):
        return f"{self.receipt_no} - {self.amount}"