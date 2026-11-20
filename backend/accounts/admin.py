from django.contrib import admin

# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Role Info", {"fields": ("role", "phone")}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Role Info", {"fields": ("role", "phone")}),)
    list_display = ("username", "email", "role", "is_staff")
