from django.shortcuts import render

# Create your views here.
from django.db import transaction
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.permissions import RolePermission
from bom.services import generate_bom

from .models import SalesOrder
from .serializers import SalesOrderSerializer

ALLOWED = {
    "DRAFT": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["IN_PRODUCTION", "CANCELLED"],
    "IN_PRODUCTION": ["DISPATCHED"],
    "INVOICED": ["CLOSED"],
}


class SalesOrderViewSet(viewsets.ModelViewSet):
    serializer_class = SalesOrderSerializer
    permission_classes = [RolePermission]
    write_roles = ("SALES",)
    filter_backends = [filters.SearchFilter]
    search_fields = ["order_no", "customer__name"]

    def get_queryset(self):
        qs = (
            SalesOrder.objects.select_related("customer")
            .prefetch_related("items__product")
            .order_by("-id")
        )
        status = self.request.query_params.get("status")
        return qs.filter(status=status) if status else qs

    def perform_destroy(self, instance):
        if instance.status != "DRAFT":
            raise ValidationError("Sirf DRAFT order delete ho sakta hai.")
        instance.delete()

    @action(detail=True, methods=["post"])
    def set_status(self, request, pk=None):
        order = self.get_object()
        new = request.data.get("status")
        if new not in ALLOWED.get(order.status, []):
            raise ValidationError(f"{order.status} se {new} allowed nahi hai.")
        with transaction.atomic():
            order.status = new
            order.save(update_fields=["status", "updated_at"])
            if new == "CONFIRMED":
                try:
                    generate_bom(order)  # confirm hote hi BOM auto-generate
                except ValueError as e:
                    raise ValidationError(str(e))  # rollback ho jayega
        return Response(self.get_serializer(order).data)