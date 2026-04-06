# filename: backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    NewsViewSet,
    PageViewSet,
    ContactMessageViewSet,
    MenuListAPIView,
    SiteSearchAPIView,
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
    # CODEX: Navbar/menu dynamic бүтэц авах endpoint.
    path("menus/", MenuListAPIView.as_view(), name="menu_list"),
    # CODEX: Site-wide search endpoint.
    path("search/", SiteSearchAPIView.as_view(), name="site_search"),
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
