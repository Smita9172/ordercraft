from django.contrib import admin, messages

from .models import PurchaseOrder, POItem
from .services import receive_po


@admin.action(description="Mark as Sent to Vendor")
def mark_sent(modeladmin, request, queryset):
    updated = queryset.filter(status="DRAFT").update(status="SENT")
    messages.success(request, f"{updated} PO(s) marked as Sent.")


@admin.action(description="Receive ALL pending quantity (full delivery)")
def receive_all(modeladmin, request, queryset):
    for po in queryset:
        try:
            qty = {i.id: i.pending_qty for i in po.items.all()}
            receive_po(po, qty)
            messages.success(request, f"{po.po_no} received. Stock updated.")
        except ValueError as e:
            messages.error(request, str(e))


class POItemInline(admin.TabularInline):
    model = POItem
    extra = 1
    fields = ("product", "ordered_qty", "received_qty", "unit_price", "pending_qty")
    readonly_fields = ("received_qty", "pending_qty")


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_no", "vendor", "bom", "po_date", "status", "total_amount")
    list_filter = ("status", "vendor")
    search_fields = ("po_no", "vendor__name")
    readonly_fields = ("po_no", "total_amount", "created_by")
    inlines = [POItemInline]
    actions = [mark_sent, receive_all]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)