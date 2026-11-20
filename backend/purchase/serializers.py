from rest_framework import serializers

from .models import PurchaseOrder, POItem


class POItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    pending_qty = serializers.DecimalField(max_digits=12, decimal_places=3, read_only=True)
    line_total = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = POItem
        fields = ["id", "product", "product_name", "ordered_qty",
                  "received_qty", "pending_qty", "unit_price", "line_total"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    bom_no = serializers.CharField(source="bom.bom_no", read_only=True, default=None)
    items = POItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ["id", "po_no", "vendor", "vendor_name", "bom", "bom_no",
                  "po_date", "expected_date", "status", "notes", "items", "total_amount"]