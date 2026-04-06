from rest_framework import viewsets, mixins, generics
from rest_framework.response import Response
from django.db.models import Q
from .models import News, Page, ContactMessage, ConsularService, MenuItem
from .serializers import (
    NewsSerializer,
    PageSerializer,
    ContactMessageSerializer,
    MenuItemSerializer,
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


# CODEX: Navbar/menu-г хэлээр шүүж tree хэлбэрээр буцаах endpoint.
class MenuListAPIView(generics.ListAPIView):
    serializer_class = MenuItemSerializer

    def get_queryset(self):
        lang = self.request.query_params.get("lang", "mn").lower()
        return (
            MenuItem.objects.filter(
                is_active=True,
                language=lang,
                parent__isnull=True,
            )
            .select_related("page")
            .order_by("order", "id")
        )


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


# CODEX: Бүх контентыг хэлээр шүүж нэг endpoint-оор хайлт хийх API.
class SiteSearchAPIView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        lang = request.query_params.get("lang", "mn").lower()
        q = (request.query_params.get("q") or "").strip()
        if len(q) < 2:
            return Response(
                {
                    "query": q,
                    "lang": lang,
                    "results": [],
                    "counts": {"news": 0, "pages": 0, "services": 0},
                }
            )

        # CODEX: Олон үгтэй хайлт дээр бүх token-ыг агуулсан үр дүн гаргахын тулд AND-ээр холбож байна.
        terms = [t for t in q.split() if t]

        def and_query(fields):
            query = Q()
            for term in terms:
                term_q = Q()
                for field in fields:
                    term_q |= Q(**{f"{field}__icontains": term})
                query &= term_q
            return query

        news_qs = (
            News.objects.filter(is_published=True, language=lang)
            .filter(and_query(["title", "body"]))
            .order_by("-published_at")[:8]
        )
        pages_qs = (
            Page.objects.filter(language=lang)
            .filter(and_query(["title", "body"]))
            .order_by("title")[:8]
        )
        services_qs = (
            ConsularService.objects.filter(
                is_active=True,
                language=lang,
                category__is_active=True,
            )
            .filter(and_query(["title", "summary", "body"]))
            .order_by("category__order", "order")[:8]
        )

        news = [
            {
                "type": "news",
                "title": n.title,
                "slug": n.slug,
                "url": f"/{lang}/news/{n.slug}",
            }
            for n in news_qs
        ]
        pages = [
            {
                "type": "page",
                "title": p.title,
                "slug": p.slug,
                "url": f"/{lang}/{p.slug}",
            }
            for p in pages_qs
        ]
        services = [
            {
                "type": "service",
                "title": s.title,
                "slug": s.slug,
                "url": f"/{lang}/services/{s.slug}",
            }
            for s in services_qs
        ]

        return Response(
            {
                "query": q,
                "lang": lang,
                "results": [*pages, *services, *news],
                "counts": {
                    "news": len(news),
                    "pages": len(pages),
                    "services": len(services),
                },
            }
        )
