from django.db import transaction
from rest_framework import serializers

from .models import SalesOrder, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    line_total = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "unit_price", "line_total"]

    def validate_product(self, product):
        if product.product_type != "FINISHED":
            raise serializers.ValidationError("Sirf finished product order ho sakta hai.")
        return product

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity 0 se zyada honi chahiye.")
        return value


class SalesOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    total_amount = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = SalesOrder
        fields = [
            "id", "order_no", "customer", "customer_name", "order_date",
            "delivery_date", "status", "notes", "items", "total_amount", "created_at",
        ]
        read_only_fields = ["order_no", "status", "created_at"]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Kam se kam ek item chahiye.")
        ids = [i["product"].id for i in items]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Ek product do baar nahi aa sakta.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        order = SalesOrder.objects.create(
            created_by=self.context["request"].user, **validated_data
        )
        for item in items:
            OrderItem.objects.create(order=order, **item)
        return order

    @transaction.atomic
    def update(self, instance, validated_data):
        if instance.status != "DRAFT":
            raise serializers.ValidationError("Sirf DRAFT order edit ho sakta hai.")
        items = validated_data.pop("items", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if items is not None:
            instance.items.all().delete()
            for item in items:
                OrderItem.objects.create(order=instance, **item)
        return instance