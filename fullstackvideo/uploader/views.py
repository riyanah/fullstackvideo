import logging

from rest_framework import viewsets, parsers
from .models import Box, Video
from .serializers import BoxSerializer, VideoSerializer
from .kafka_producer import publish_video_uploaded

logger = logging.getLogger(__name__)


class BoxViewset(viewsets.ModelViewSet):
    queryset = Box.objects.all()
    serializer_class = BoxSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    http_method_names = ['get', 'post', 'patch', 'delete']


class VideoViewset(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def perform_create(self, serializer):
        video = serializer.save()
        try:
            publish_video_uploaded(video)
        except Exception:
            logger.exception('Failed to publish Kafka event for video %d', video.id)