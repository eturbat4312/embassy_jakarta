from django.db import models
from django.core.exceptions import ValidationError

LANG_CHOICES = (
    ("mn", "Mongolian"),
    ("en", "English"),
    ("id", "Indonesian"),
)


class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class News(TimeStamped):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True)
    language = models.CharField(max_length=2, choices=LANG_CHOICES, default="mn")
    cover = models.ImageField(upload_to="news/", blank=True, null=True)
    body = models.TextField()
    published_at = models.DateTimeField()
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return f"{self.language} | {self.title}"


class NewsImage(TimeStamped):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="news/gallery/")
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.news.title} – {self.order}"


class Page(TimeStamped):
    slug = models.SlugField(max_length=200)
    language = models.CharField(max_length=2, choices=LANG_CHOICES, default="mn")
    title = models.CharField(max_length=300)
    hero_image = models.ImageField(upload_to="pages/heroes/", blank=True, null=True)
    body = models.TextField()

    class Meta:
        unique_together = ("slug", "language")

    def __str__(self):
        return f"{self.slug} ({self.language})"


# CODEX: Admin-аас navbar/menu динамикаар удирдахад зориулсан мод бүтэцтэй item.
class MenuItem(TimeStamped):
    ITEM_TYPE_CHOICES = (
        ("internal_page", "Internal page"),
        ("internal_path", "Internal path"),
        ("external_url", "External URL"),
    )

    language = models.CharField(max_length=2, choices=LANG_CHOICES, default="mn")
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)

    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )

    item_type = models.CharField(
        max_length=20, choices=ITEM_TYPE_CHOICES, default="internal_path"
    )
    # CODEX: internal_page үед page ашиглагдана.
    page = models.ForeignKey(
        Page, on_delete=models.SET_NULL, null=True, blank=True, related_name="menu_items"
    )
    # CODEX: internal_path үед /mn/news зэрэг path хадгална.
    path = models.CharField(max_length=255, blank=True)
    # CODEX: external_url үед бүрэн URL хадгална.
    url = models.URLField(blank=True)
    open_in_new_tab = models.BooleanField(default=False)

    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["language", "parent_id", "order", "id"]

    def __str__(self):
        return f"{self.language} | {self.title}"

    # CODEX: item_type-т тохирсон target талбарууд заавал бөглөгдсөн эсэхийг шалгана.
    def clean(self):
        super().clean()

        if self.item_type == "internal_page":
            if not self.page_id:
                raise ValidationError({"page": "internal_page үед page заавал сонгоно."})
        elif self.item_type == "internal_path":
            if not (self.path or "").strip():
                raise ValidationError({"path": "internal_path үед path заавал бөглөнө."})
        elif self.item_type == "external_url":
            if not (self.url or "").strip():
                raise ValidationError({"url": "external_url үед url заавал бөглөнө."})

        # CODEX: Top-level ба child item ижил language-тай байх ёстой.
        if self.parent_id and self.parent and self.parent.language != self.language:
            raise ValidationError(
                {"language": "Child menu item нь parent-тэйгээ ижил хэлтэй байх ёстой."}
            )

    # CODEX: Admin/UI-аас save хийх үед validation заавал ажиллах баталгаа.
    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class ContactMessage(TimeStamped):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    message = models.TextField()

    def __str__(self):
        return f"{self.name} <{self.email}>"


class ServiceCategory(TimeStamped):
    slug = models.SlugField(max_length=100)
    language = models.CharField(max_length=2, choices=LANG_CHOICES, default="mn")
    name = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("slug", "language")
        ordering = ["order"]

    def __str__(self):
        return f"{self.language} | {self.name}"


class ConsularService(TimeStamped):
    category = models.ForeignKey(
        ServiceCategory, on_delete=models.CASCADE, related_name="services"
    )
    slug = models.SlugField(max_length=200)
    language = models.CharField(max_length=2, choices=LANG_CHOICES, default="mn")

    title = models.CharField(max_length=300)
    summary = models.TextField(blank=True)
    body = models.TextField(blank=True)

    # холбоо барих блок (service бүр дээр гарна)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    office_hours = models.CharField(max_length=255, blank=True)
    contact_note = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("slug", "language")
        ordering = ["order"]

    def __str__(self):
        return f"{self.language} | {self.title}"


class ServiceResource(TimeStamped):
    TYPE_CHOICES = (
        ("pdf", "PDF татах"),
        ("link", "Гадаад линк"),
    )

    service = models.ForeignKey(
        ConsularService, on_delete=models.CASCADE, related_name="resources"
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)

    file = models.FileField(upload_to="services/resources/", blank=True, null=True)
    url = models.URLField(blank=True)

    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.service.title} – {self.title}"
