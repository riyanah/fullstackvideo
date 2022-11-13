# Create your models here.
from django.db import models

from django.core.validators import FileExtensionValidator
 
# Box supports all file types
class Box(models.Model):
    title = models.CharField(max_length=30)
    document = models.FileField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        verbose_name_plural = 'Boxes'

    
# Video supports mp4 file type only
class Video(models.Model):
    title = models.CharField(max_length=30)
    document = models.FileField(validators=[FileExtensionValidator( ['mp4'] ) ], max_length=30) # in future use python-magic for mp4 validation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        verbose_name_plural = 'Videos'
