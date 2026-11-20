from collections import defaultdict
from decimal import Decimal

from django.db import transaction

from .models import BOM, BOMItem


@transaction.atomic
def generate_bom(order):
    """Order ke finished products ki recipe se raw material ki total list banao."""
    required = defaultdict(lambda: Decimal("0"))

    items = order.items.select_related("product")
    for item in items:
        for comp in item.product.components.all():
            required[comp.component_id] += comp.qty_per_unit * item.quantity

    if not required:
        raise ValueError(
            "Is order ke products ki recipe (components) set nahi hai, ya order mein items nahi hain."
        )

    bom, _ = BOM.objects.get_or_create(order=order)
    bom.items.all().delete()  # dobara generate karne par purani list hatao

    BOMItem.objects.bulk_create(
        [
            BOMItem(bom=bom, component_id=comp_id, required_qty=qty)
            for comp_id, qty in required.items()
        ]
    )
    return bom