from rest_framework import viewsets, parsers
from .models import Box
from .serializers import BoxSerializer


class BoxViewset(viewsets.ModelViewSet):
    queryset = Box.objects.all()
    serializer_class = BoxSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    http_method_names = ['get', 'post', 'patch', 'delete']