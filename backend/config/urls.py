from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    return JsonResponse({"status": "OrderCraft backend is running"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/auth/", include("accounts.urls")),
    path("api/masters/", include("masters.urls")),
    path("api/sales/", include("sales.urls")),
    path("api/bom/", include("bom.urls")),
    path("api/purchase/", include("purchase.urls")),
    path("api/billing/", include("billing.urls")),
    path("api/reports/", include("reports.urls")),
]