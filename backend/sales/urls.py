from rest_framework.routers import DefaultRouter

from .views import SalesOrderViewSet

router = DefaultRouter()
router.register("orders", SalesOrderViewSet, basename="order")
urlpatterns = router.urls