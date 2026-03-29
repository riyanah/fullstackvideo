from rest_framework import serializers
from .models import Box, Video


class BoxSerializer(serializers.ModelSerializer):

    class Meta:
        model = Box
        fields = '__all__'


class VideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Video
        fields = '__all__'
        read_only_fields = [
            'processing_status',
            'thumbnail_url',
            'duration_seconds',
            'width',
            'height',
            'processing_error',
        ]