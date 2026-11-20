from django.shortcuts import render

# Create your views here.
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.permissions import RolePermission
from sales.models import SalesOrder

from .models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer
from .services import generate_invoice


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [RolePermission]
    write_roles = ("ACCOUNTS",)

    def get_queryset(self):
        qs = Invoice.objects.select_related("order__customer").prefetch_related(
            "payments"
        ).order_by("-id")
        status = self.request.query_params.get("status")
        return qs.filter(status=status) if status else qs

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Body: {"order": 1}"""
        try:
            order = SalesOrder.objects.get(pk=request.data.get("order"))
        except SalesOrder.DoesNotExist:
            raise ValidationError("Order nahi mila.")
        if order.status != "DISPATCHED":
            raise ValidationError("Invoice sirf DISPATCHED order ka banta hai.")
        try:
            invoice = generate_invoice(order)
        except ValueError as e:
            raise ValidationError(str(e))
        return Response(self.get_serializer(invoice).data, status=201)


class PaymentViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin,
    mixins.RetrieveModelMixin, viewsets.GenericViewSet,
):
    queryset = Payment.objects.select_related("invoice").order_by("-id")
    serializer_class = PaymentSerializer
    permission_classes = [RolePermission]
    write_roles = ("ACCOUNTS",)