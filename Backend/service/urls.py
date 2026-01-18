"""
URLs for service app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceRequestViewSet

router = DefaultRouter()
router.register(r'requests', ServiceRequestViewSet, basename='servicerequest')

urlpatterns = [
    path('', include(router.urls)),
]
