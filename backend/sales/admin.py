from django.contrib import admin, messages

from bom.services import generate_bom

from .models import SalesOrder, OrderItem


@admin.action(description="Generate BOM for selected orders")
def generate_bom_action(modeladmin, request, queryset):
    for order in queryset:
        try:
            bom = generate_bom(order)
            messages.success(request, f"{bom.bom_no} generated for {order.order_no}")
        except ValueError as e:
            messages.error(request, f"{order.order_no}: {e}")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ("line_total",)


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ("order_no", "customer", "order_date", "status", "total_amount")
    list_filter = ("status", "order_date")
    search_fields = ("order_no", "customer__name")
    readonly_fields = ("order_no", "total_amount", "created_by")
    inlines = [OrderItemInline]
    actions = [generate_bom_action]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)