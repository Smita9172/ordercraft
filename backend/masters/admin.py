from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Customer, Vendor, Product, ProductComponent


class ProductComponentInline(admin.TabularInline):
    model = ProductComponent
    fk_name = "product"
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "product_type", "price", "stock_qty")
    list_filter = ("product_type",)
    search_fields = ("sku", "name")
    inlines = [ProductComponentInline]


admin.site.register(Customer)
admin.site.register(Vendor)