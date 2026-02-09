from rest_framework import viewsets, mixins, generics
from .models import News, Page, ContactMessage, ConsularService
from .serializers import (
    NewsSerializer,
    PageSerializer,
    ContactMessageSerializer,
    ConsularServiceListSerializer,
    ConsularServiceDetailSerializer,
)


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.filter(is_published=True)
    serializer_class = NewsSerializer
    lookup_field = "slug"

    def get_queryset(self):
        qs = super().get_queryset()
        lang = self.request.query_params.get("lang")
        if lang:
            qs = qs.filter(language=lang)
        return qs


class PageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = "slug"

    def get_queryset(self):
        qs = super().get_queryset()

        lang = self.request.query_params.get("lang")
        if lang:
            qs = qs.filter(language=lang)

        slug = self.request.query_params.get("slug")
        if slug:
            qs = qs.filter(slug=slug)

        return qs


class ContactMessageViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer


class ConsularServiceListAPIView(generics.ListAPIView):
    serializer_class = ConsularServiceListSerializer

    def get_queryset(self):
        lang = self.request.query_params.get("lang", "mn").lower()
        return (
            ConsularService.objects.select_related("category")
            .filter(is_active=True, language=lang, category__is_active=True)
            .order_by("category__order", "order")
        )


class ConsularServiceDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ConsularServiceDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        lang = self.request.query_params.get("lang", "mn").lower()
        return (
            ConsularService.objects.select_related("category")
            .prefetch_related("resources")
            .filter(is_active=True, language=lang, category__is_active=True)
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
