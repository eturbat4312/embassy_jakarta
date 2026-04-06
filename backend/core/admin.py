# backend/core/admin.py
from django.contrib import admin
from django.db import models
from tinymce.widgets import TinyMCE

from .models import (
    News,
    Page,
    ContactMessage,
    MenuItem,
    ServiceCategory,
    ConsularService,
    ServiceResource,
    NewsImage,
)


class NewsImageInline(admin.TabularInline):
    model = NewsImage
    extra = 1
    fields = ("image", "caption", "order")
    ordering = ("order",)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title", "language", "published_at", "is_published")
    list_filter = ("language", "is_published")
    search_fields = ("title", "body")
    prepopulated_fields = {"slug": ("title",)}
    formfield_overrides = {models.TextField: {"widget": TinyMCE()}}

    inlines = [NewsImageInline]  # ✅ НЭМ


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("slug", "language", "title")
    list_filter = ("language",)
    search_fields = ("title",)
    formfield_overrides = {models.TextField: {"widget": TinyMCE()}}


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created_at")
    search_fields = ("name", "email", "message")


# CODEX: Navbar/menu-г admin дээрээс динамикаар удирдах ModelAdmin.
@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "language",
        "parent",
        "item_type",
        "order",
        "is_active",
    )
    list_filter = ("language", "is_active", "item_type", "parent")
    search_fields = ("title", "slug", "path", "url")
    ordering = ("language", "parent__id", "order", "id")
    prepopulated_fields = {"slug": ("title",)}

    # CODEX: Контент менежер input хийх үед ойлгомжтой байлгахын тулд хэсэглэв.
    fieldsets = (
        (
            "Үндсэн",
            {
                "fields": (
                    "language",
                    "title",
                    "slug",
                    "parent",
                    "order",
                    "is_active",
                )
            },
        ),
        (
            "Линк тохиргоо",
            {
                "fields": (
                    "item_type",
                    "page",
                    "path",
                    "url",
                    "open_in_new_tab",
                )
            },
        ),
    )


# -----------------------------
# Consular Services Admin
# -----------------------------


class ServiceResourceInline(admin.TabularInline):
    model = ServiceResource
    extra = 1
    fields = ("title", "type", "file", "url", "order", "is_active")
    ordering = ("order",)


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "language", "order", "is_active")
    list_filter = ("language", "is_active")
    search_fields = ("name", "slug")
    ordering = ("language", "order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ConsularService)
class ConsularServiceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "language",
        "category",
        "order",
        "is_active",
        "contact_email",
    )
    list_filter = ("language", "category", "is_active")
    search_fields = ("title", "slug")
    ordering = ("language", "category", "order")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ServiceResourceInline]

    formfield_overrides = {models.TextField: {"widget": TinyMCE()}}

    fieldsets = (
        (
            "Үндсэн мэдээлэл",
            {
                "fields": (
                    "category",
                    "language",
                    "title",
                    "slug",
                    "summary",
                    "body",
                    "order",
                    "is_active",
                )
            },
        ),
        (
            "Холбоо барих",
            {
                "fields": (
                    "contact_email",
                    "contact_phone",
                    "office_hours",
                    "contact_note",
                )
            },
        ),
    )
