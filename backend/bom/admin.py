from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import BOM, BOMItem


class BOMItemInline(admin.TabularInline):
    model = BOMItem
    extra = 0
    can_delete = False
    fields = ("component", "required_qty", "available_qty", "shortage_qty")
    readonly_fields = ("component", "required_qty", "available_qty", "shortage_qty")

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(BOM)
class BOMAdmin(admin.ModelAdmin):
    list_display = ("bom_no", "order", "generated_at")
    search_fields = ("bom_no", "order__order_no")
    readonly_fields = ("bom_no", "order", "generated_at")
    inlines = [BOMItemInline]