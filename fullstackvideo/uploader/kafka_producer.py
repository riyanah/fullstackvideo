import json
import logging

from confluent_kafka import Producer
from django.conf import settings

logger = logging.getLogger(__name__)

_producer = None


def _get_producer():
    global _producer
    if _producer is None:
        _producer = Producer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'client.id': 'django-video-producer',
        })
    return _producer


def _delivery_callback(err, msg):
    if err is not None:
        logger.error('Kafka delivery failed: %s', err)
    else:
        logger.info(
            'Kafka message delivered to %s [%d] @ %d',
            msg.topic(), msg.partition(), msg.offset(),
        )


def publish_video_uploaded(video):
    """Publish a video_uploaded event after a successful upload + DB persist."""
    payload = {
        'event_type': 'video_uploaded',
        'video_id': video.id,
        's3_key': video.video_url.name,
        'filename': video.video_url.name.split('/')[-1],
        'uploaded_at': video.created_at.isoformat(),
    }

    producer = _get_producer()
    producer.produce(
        topic=settings.KAFKA_TOPIC_VIDEO_UPLOADED,
        key=str(video.id).encode('utf-8'),
        value=json.dumps(payload).encode('utf-8'),
        callback=_delivery_callback,
    )
    producer.flush(timeout=5)
    logger.info('Published video_uploaded event for video %d', video.id)
