from decimal import Decimal

from rest_framework import serializers

from .models import Invoice, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "receipt_no", "invoice", "amount", "payment_date",
                  "method", "reference"]
        read_only_fields = ["receipt_no"]

    def validate(self, attrs):
        invoice = attrs["invoice"]
        amount = attrs["amount"]
        if invoice.status == "CANCELLED":
            raise serializers.ValidationError("Cancelled invoice par payment nahi.")
        if amount <= 0:
            raise serializers.ValidationError("Amount 0 se zyada hona chahiye.")
        if amount > invoice.balance_amount:
            raise serializers.ValidationError(
                f"Amount balance se zyada hai. Baaki: {invoice.balance_amount}"
            )
        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    order_no = serializers.CharField(source="order.order_no", read_only=True)
    customer_name = serializers.CharField(source="order.customer.name", read_only=True)
    paid_amount = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    balance_amount = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = ["id", "invoice_no", "order", "order_no", "customer_name",
                  "invoice_date", "due_date", "subtotal", "tax_rate", "tax_amount",
                  "total_amount", "paid_amount", "balance_amount", "status", "payments"]