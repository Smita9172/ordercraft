from rest_framework import serializers

from .models import BOM, BOMItem


class BOMItemSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source="component.name", read_only=True)
    unit = serializers.CharField(source="component.unit", read_only=True)
    available_qty = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    shortage_qty = serializers.DecimalField(max_digits=12, decimal_places=3, read_only=True)

    class Meta:
        model = BOMItem
        fields = ["id", "component", "component_name", "unit",
                  "required_qty", "available_qty", "shortage_qty"]


class BOMSerializer(serializers.ModelSerializer):
    order_no = serializers.CharField(source="order.order_no", read_only=True)
    customer_name = serializers.CharField(source="order.customer.name", read_only=True)
    items = BOMItemSerializer(many=True, read_only=True)

    class Meta:
        model = BOM
        fields = ["id", "bom_no", "order", "order_no", "customer_name",
                  "generated_at", "items"]