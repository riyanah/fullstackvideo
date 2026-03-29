"""
Background worker that consumes video_uploaded events from Kafka
and performs post-upload processing (thumbnail generation, metadata extraction).

Run via: python -m uploader.worker
"""

import json
import logging
import os
import signal
import subprocess
import tempfile

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fullstackvideo.settings')
django.setup()

import boto3  # noqa: E402
from confluent_kafka import Consumer, KafkaError  # noqa: E402
from django.conf import settings  # noqa: E402
from django.core.files.storage import default_storage  # noqa: E402

from uploader.models import Video  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger('uploader.worker')

running = True


def _signal_handler(sig, frame):
    global running
    logger.info('Received signal %s, shutting down gracefully...', sig)
    running = False


signal.signal(signal.SIGINT, _signal_handler)
signal.signal(signal.SIGTERM, _signal_handler)


def _get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )


def _download_from_s3(s3_client, s3_key, local_path):
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    logger.info('Downloading s3://%s/%s -> %s', bucket, s3_key, local_path)
    s3_client.download_file(bucket, s3_key, local_path)


def _save_thumbnail(local_path, s3_key):
    """Save thumbnail via Django's default storage so it gets the same access as videos."""
    logger.info('Saving thumbnail %s -> storage:%s', local_path, s3_key)
    with open(local_path, 'rb') as f:
        saved_name = default_storage.save(s3_key, f)
    return saved_name


def _extract_metadata(video_path):
    """Use ffprobe to extract duration, width, and height."""
    cmd = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        video_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    probe = json.loads(result.stdout)

    duration = None
    width = None
    height = None

    for stream in probe.get('streams', []):
        if stream.get('codec_type') == 'video':
            width = int(stream.get('width', 0)) or None
            height = int(stream.get('height', 0)) or None
            break

    fmt = probe.get('format', {})
    if fmt.get('duration'):
        duration = float(fmt['duration'])

    return duration, width, height


def _generate_thumbnail(video_path, thumbnail_path):
    """Extract a single frame at 1 second (or 0 if shorter) as a JPEG thumbnail."""
    cmd = [
        'ffmpeg',
        '-y',
        '-i', video_path,
        '-ss', '00:00:01',
        '-vframes', '1',
        '-q:v', '2',
        thumbnail_path,
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)


def process_video(event):
    video_id = event['video_id']
    s3_key = event['s3_key']

    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist:
        logger.error('Video %d not found in database, skipping', video_id)
        return

    if video.processing_status == Video.ProcessingStatus.COMPLETED:
        logger.info('Video %d already processed, skipping', video_id)
        return

    video.processing_status = Video.ProcessingStatus.PROCESSING
    video.save(update_fields=['processing_status', 'updated_at'])
    logger.info('Processing video %d (s3_key=%s)', video_id, s3_key)

    s3_client = _get_s3_client()

    with tempfile.TemporaryDirectory(prefix='video-proc-') as tmpdir:
        local_video = os.path.join(tmpdir, 'video.mp4')
        thumbnail_path = os.path.join(tmpdir, 'thumbnail.jpg')

        try:
            _download_from_s3(s3_client, s3_key, local_video)

            duration, width, height = _extract_metadata(local_video)
            video.duration_seconds = duration
            video.width = width
            video.height = height

            _generate_thumbnail(local_video, thumbnail_path)

            thumb_s3_key = f'thumbnails/{video_id}.jpg'
            saved_name = _save_thumbnail(thumbnail_path, thumb_s3_key)
            video.thumbnail_url = default_storage.url(saved_name)

            video.processing_status = Video.ProcessingStatus.COMPLETED
            video.processing_error = ''
            video.save(update_fields=[
                'processing_status', 'thumbnail_url',
                'duration_seconds', 'width', 'height',
                'processing_error', 'updated_at',
            ])
            logger.info('Video %d processed successfully', video_id)

        except Exception as exc:
            logger.exception('Failed to process video %d', video_id)
            video.processing_status = Video.ProcessingStatus.FAILED
            video.processing_error = str(exc)[:1000]
            video.save(update_fields=['processing_status', 'processing_error', 'updated_at'])


def run_consumer():
    consumer = Consumer({
        'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
        'group.id': 'video-processing-worker',
        'auto.offset.reset': 'earliest',
        'enable.auto.commit': True,
    })
    topic = settings.KAFKA_TOPIC_VIDEO_UPLOADED
    consumer.subscribe([topic])
    logger.info('Worker subscribed to topic "%s", waiting for events...', topic)

    try:
        while running:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                logger.error('Kafka consumer error: %s', msg.error())
                continue

            try:
                event = json.loads(msg.value().decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                logger.error('Failed to decode message: %s', msg.value())
                continue

            logger.info('Received event: %s', event.get('event_type'))

            if event.get('event_type') == 'video_uploaded':
                process_video(event)
            else:
                logger.warning('Unknown event type: %s', event.get('event_type'))
    finally:
        consumer.close()
        logger.info('Consumer closed.')


if __name__ == '__main__':
    logger.info('Starting video processing worker...')
    run_consumer()
