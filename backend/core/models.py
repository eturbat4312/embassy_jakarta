from django.db import models

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
