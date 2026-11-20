from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.permissions import RolePermission

from .models import PurchaseOrder
from .serializers import PurchaseOrderSerializer
from .services import receive_po


class PurchaseOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [RolePermission]
    write_roles = ("PURCHASE",)

    def get_queryset(self):
        qs = PurchaseOrder.objects.select_related("vendor", "bom").prefetch_related(
            "items__product"
        ).order_by("-id")
        status = self.request.query_params.get("status")
        return qs.filter(status=status) if status else qs

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        po = self.get_object()
        if po.status != "DRAFT":
            raise ValidationError("Sirf DRAFT PO vendor ko bheja ja sakta hai.")
        po.status = "SENT"
        po.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(po).data)

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        """Body: {"items": [{"id": 1, "qty": 100}]}  |  khaali body = poora pending receive."""
        po = self.get_object()
        if po.status not in ("SENT", "PARTIALLY_RECEIVED"):
            raise ValidationError("Pehle PO ko SENT karo.")
        rows = request.data.get("items")
        if rows:
            quantities = {int(r["id"]): r["qty"] for r in rows}
        else:
            quantities = {i.id: i.pending_qty for i in po.items.all()}
        try:
            po = receive_po(po, quantities)
        except ValueError as e:
            raise ValidationError(str(e))
        return Response(self.get_serializer(po).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        po = self.get_object()
        if po.status in ("RECEIVED", "PARTIALLY_RECEIVED", "CANCELLED"):
            raise ValidationError("Is status par cancel nahi ho sakta.")
        po.status = "CANCELLED"
        po.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(po).data)