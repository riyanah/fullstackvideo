from rest_framework.routers import SimpleRouter
from .views import BoxViewset

router = SimpleRouter()
router.register('accounts', BoxViewset)
urlpatterns = router.urls