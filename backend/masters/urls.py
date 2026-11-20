from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet, VendorViewSet, ProductViewSet, ProductComponentViewSet,
)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("vendors", VendorViewSet, basename="vendor")
router.register("products", ProductViewSet, basename="product")
router.register("components", ProductComponentViewSet, basename="component")

urlpatterns = router.urls