from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.permissions import RolePermission
from purchase.serializers import PurchaseOrderSerializer
from purchase.services import create_pos_from_bom

from .models import BOM
from .serializers import BOMSerializer
from .services import generate_bom


class BOMViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BOMSerializer
    permission_classes = [RolePermission]
    write_roles = ("PURCHASE", "SALES")

    def get_queryset(self):
        return BOM.objects.select_related("order__customer").prefetch_related(
            "items__component"
        ).order_by("-id")

    @action(detail=True, methods=["post"])
    def regenerate(self, request, pk=None):
        bom = self.get_object()
        try:
            bom = generate_bom(bom.order)
        except ValueError as e:
            raise ValidationError(str(e))
        return Response(self.get_serializer(bom).data)

    @action(detail=True, methods=["post"])
    def create_po(self, request, pk=None):
        bom = self.get_object()
        try:
            pos = create_pos_from_bom(bom, request.user)
        except ValueError as e:
            raise ValidationError(str(e))
        return Response(PurchaseOrderSerializer(pos, many=True).data, status=201)