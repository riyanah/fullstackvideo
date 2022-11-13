from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoxViewset, VideoViewset

router = DefaultRouter()
router.register('accounts', BoxViewset, basename="box")
router.register('videos', VideoViewset, basename="video")
urlpatterns = [
    path('', include(router.urls)),
]