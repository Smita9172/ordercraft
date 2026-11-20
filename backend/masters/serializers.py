from rest_framework import serializers

from .models import Customer, Vendor, Product, ProductComponent


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"


class ProductComponentSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source="component.name", read_only=True)

    class Meta:
        model = ProductComponent
        fields = ["id", "product", "component", "component_name", "qty_per_unit"]


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    components = ProductComponentSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "sku", "name", "product_type", "unit", "price",
            "stock_qty", "vendor", "vendor_name", "components",
        ]