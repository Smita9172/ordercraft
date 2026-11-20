from rest_framework import filters, viewsets

from accounts.permissions import RolePermission

from .models import Customer, Vendor, Product, ProductComponent
from .serializers import (
    CustomerSerializer, VendorSerializer,
    ProductSerializer, ProductComponentSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.order_by("id")
    serializer_class = CustomerSerializer
    permission_classes = [RolePermission]
    write_roles = ("SALES",)
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "email", "phone"]


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.order_by("id")
    serializer_class = VendorSerializer
    permission_classes = [RolePermission]
    write_roles = ("PURCHASE",)
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "email", "phone"]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [RolePermission]
    write_roles = ("PURCHASE", "SALES")
    filter_backends = [filters.SearchFilter]
    search_fields = ["sku", "name"]

    def get_queryset(self):
        qs = (
            Product.objects.select_related("vendor")
            .prefetch_related("components__component")
            .order_by("id")
        )
        ptype = self.request.query_params.get("product_type")
        return qs.filter(product_type=ptype) if ptype else qs


class ProductComponentViewSet(viewsets.ModelViewSet):
    queryset = ProductComponent.objects.select_related("component").order_by("id")
    serializer_class = ProductComponentSerializer
    permission_classes = [RolePermission]
    write_roles = ("PURCHASE", "SALES")