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