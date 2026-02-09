# filename: backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    NewsViewSet,
    PageViewSet,
    ContactMessageViewSet,
    ConsularServiceListAPIView,
    ConsularServiceDetailAPIView,
)

router = DefaultRouter()
router.register(r"news", NewsViewSet, basename="news")
router.register(r"pages", PageViewSet, basename="pages")
router.register(r"contact", ContactMessageViewSet, basename="contact")

urlpatterns = [
    # ViewSets
    path("", include(router.urls)),
    # Consular services (read-only)
    path(
        "consular-services/",
        ConsularServiceListAPIView.as_view(),
        name="consular_service_list",
    ),
    path(
        "consular-services/<slug:slug>/",
        ConsularServiceDetailAPIView.as_view(),
        name="consular_service_detail",
    ),
]
