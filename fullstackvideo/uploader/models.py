from django.db import models
from django.core.validators import FileExtensionValidator


class Box(models.Model):
    title = models.CharField(max_length=30)
    document = models.FileField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Boxes'


class Video(models.Model):
    class ProcessingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    title = models.CharField(max_length=30)
    video_url = models.FileField(
        validators=[FileExtensionValidator(['mp4'])],
        max_length=200,
    )
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PENDING,
    )
    thumbnail_url = models.URLField(max_length=500, blank=True, default='')
    duration_seconds = models.FloatField(null=True, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    processing_error = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Videos'

    def __str__(self):
        return f'{self.title} ({self.processing_status})'
