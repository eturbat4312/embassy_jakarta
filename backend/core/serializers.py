from rest_framework import serializers
from .models import (
    News,
    Page,
    ContactMessage,
    ConsularService,
    ServiceResource,
    ServiceCategory,
    NewsImage,
)


class NewsImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = NewsImage
        fields = ("id", "image", "caption", "order")

    def get_image(self, obj):
        if obj.image:
            return obj.image.url  # ✅ relative
        return None


class NewsSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    images = NewsImageSerializer(many=True, read_only=True)

    class Meta:
        model = News
        fields = (
            "id",
            "title",
            "slug",
            "language",
            "cover",
            "images",
            "body",
            "published_at",
        )

    def get_cover(self, obj):
        if obj.cover:
            return obj.cover.url  # ✅ relative: /media/news/...
        return None


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = (
            "id",
            "slug",
            "language",
            "title",
            "hero_image",
            "body",
        )


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = (
            "id",
            "name",
            "email",
            "message",
            "created_at",
        )
        read_only_fields = ("created_at",)


class ServiceResourceSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceResource
        fields = ["id", "type", "title", "file_url", "url", "order"]

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url  # ✅ relative: /media/...
        return None


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "slug", "name", "order"]


class ConsularServiceListSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer()

    class Meta:
        model = ConsularService
        fields = [
            "id",
            "slug",
            "language",
            "title",
            "summary",
            "order",
            "category",
        ]


class ConsularServiceDetailSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer()
    resources = ServiceResourceSerializer(many=True)

    class Meta:
        model = ConsularService
        fields = [
            "id",
            "slug",
            "language",
            "title",
            "summary",
            # body-оос html/text гарна (TinyMCE)
            "body",
            "order",
            "is_active",
            "category",
            "resources",
            "contact_email",
            "contact_phone",
            "office_hours",
            "contact_note",
        ]
