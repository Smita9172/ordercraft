from collections import defaultdict
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from .models import PurchaseOrder, POItem


@transaction.atomic
def create_pos_from_bom(bom, user=None):
    """BOM ki shortage se vendor-wise Purchase Orders banao."""
    if bom.purchase_orders.exclude(status="CANCELLED").exists():
        raise ValueError(f"{bom.bom_no} ke liye PO pehle se bana hua hai.")

    by_vendor = defaultdict(list)
    no_vendor = []

    for item in bom.items.select_related("component", "component__vendor"):
        shortage = item.shortage_qty
        if shortage <= 0:
            continue
        vendor = item.component.vendor
        if vendor is None:
            no_vendor.append(item.component.name)
            continue
        by_vendor[vendor].append((item.component, shortage))

    if no_vendor:
        raise ValueError(
            "In products ka vendor set nahi hai: " + ", ".join(no_vendor)
        )
    if not by_vendor:
        raise ValueError("Koi shortage nahi hai, PO ki zaroorat nahi.")

    pos = []
    for vendor, lines in by_vendor.items():
        po = PurchaseOrder.objects.create(vendor=vendor, bom=bom, created_by=user)
        POItem.objects.bulk_create(
            [
                POItem(po=po, product=prod, ordered_qty=qty, unit_price=prod.price)
                for prod, qty in lines
            ]
        )
        pos.append(po)
    return pos


@transaction.atomic
def receive_po(po, quantities):
    """quantities = {po_item_id: qty_received_now}. Stock badhao aur status update karo."""
    if po.status in ("CANCELLED", "RECEIVED"):
        raise ValueError(f"{po.po_no} ka status {po.status} hai, receive nahi ho sakta.")

    for item in po.items.select_related("product"):
        qty = Decimal(str(quantities.get(item.id, 0)))
        if qty <= 0:
            continue
        if qty > item.pending_qty:
            raise ValueError(
                f"{item.product.name}: pending {item.pending_qty} hai, {qty} receive nahi ho sakta."
            )
        item.received_qty = F("received_qty") + qty
        item.save(update_fields=["received_qty"])
        item.product.__class__.objects.filter(pk=item.product_id).update(
            stock_qty=F("stock_qty") + qty
        )

    po.refresh_from_db()
    items = list(po.items.all())
    if all(i.received_qty >= i.ordered_qty for i in items):
        po.status = "RECEIVED"
    elif any(i.received_qty > 0 for i in items):
        po.status = "PARTIALLY_RECEIVED"
    po.save(update_fields=["status", "updated_at"])
    return po