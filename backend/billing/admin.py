from django.contrib import admin

from .models import Invoice, Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 1
    fields = ("receipt_no", "amount", "payment_date", "method", "reference")
    readonly_fields = ("receipt_no",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_no", "order", "total_amount",
        "paid_amount", "balance_amount", "status",
    )
    list_filter = ("status", "invoice_date")
    search_fields = ("invoice_no", "order__order_no", "order__customer__name")
    readonly_fields = (
        "invoice_no", "order", "subtotal", "tax_rate", "tax_amount",
        "total_amount", "paid_amount", "balance_amount",
    )
    inlines = [PaymentInline]

    def has_add_permission(self, request):
        return False  # invoice sirf order se generate hoga


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("receipt_no", "invoice", "amount", "method", "payment_date")
    search_fields = ("receipt_no", "invoice__invoice_no")