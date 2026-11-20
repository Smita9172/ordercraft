from django.db.models import Count, F, Sum
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Invoice, Payment
from masters.models import Product
from purchase.models import PurchaseOrder
from sales.models import SalesOrder


def num(value):
    return float(value or 0)


class DashboardView(APIView):
    def get(self, request):
        live = Invoice.objects.exclude(status="CANCELLED")

        invoiced = live.aggregate(t=Sum("total_amount"))["t"] or 0
        received = (
            Payment.objects.exclude(invoice__status="CANCELLED")
            .aggregate(t=Sum("amount"))["t"] or 0
        )

        orders_by_status = {
            r["status"]: r["n"]
            for r in SalesOrder.objects.values("status").annotate(n=Count("id"))
        }
        po_by_status = {
            r["status"]: r["n"]
            for r in PurchaseOrder.objects.values("status").annotate(n=Count("id"))
        }

        top_customers = (
            live.values(name=F("order__customer__name"))
            .annotate(total=Sum("total_amount"))
            .order_by("-total")[:5]
        )
        monthly = (
            live.annotate(month=TruncMonth("invoice_date"))
            .values("month")
            .annotate(total=Sum("total_amount"))
            .order_by("month")
        )
        low_stock = Product.objects.filter(product_type="RAW", stock_qty__lt=50)

        return Response({
            "total_orders": SalesOrder.objects.count(),
            "total_invoiced": num(invoiced),
            "total_received": num(received),
            "outstanding": num(invoiced) - num(received),
            "pending_pos": sum(
                po_by_status.get(s, 0) for s in ("DRAFT", "SENT", "PARTIALLY_RECEIVED")
            ),
            "orders_by_status": orders_by_status,
            "po_by_status": po_by_status,
            "top_customers": [
                {"name": r["name"], "total": num(r["total"])} for r in top_customers
            ],
            "monthly_sales": [
                {"month": r["month"].strftime("%b %Y"), "total": num(r["total"])}
                for r in monthly
            ],
            "low_stock": [
                {"sku": p.sku, "name": p.name, "stock": num(p.stock_qty)}
                for p in low_stock
            ],
        })