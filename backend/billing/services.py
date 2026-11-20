from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone

from .models import Invoice


@transaction.atomic
def generate_invoice(order, tax_rate=Decimal("18.00")):
    if Invoice.objects.filter(order=order).exists():
        raise ValueError("Is order ka invoice pehle se bana hua hai.")
    if order.status == "CANCELLED":
        raise ValueError("Cancelled order ka invoice nahi ban sakta.")

    subtotal = order.total_amount
    if subtotal <= 0:
        raise ValueError("Order mein items nahi hain.")

    tax = (subtotal * tax_rate / 100).quantize(Decimal("0.01"), ROUND_HALF_UP)
    invoice = Invoice.objects.create(
        order=order,
        due_date=timezone.localdate() + timedelta(days=30),
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax,
        total_amount=subtotal + tax,
    )
    order.status = "INVOICED"
    order.save(update_fields=["status", "updated_at"])
    return invoice