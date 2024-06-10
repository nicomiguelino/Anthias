import uuid
from django.db import models
from django.utils import timezone


def generate_uuid() -> str:
    return uuid.uuid4().hex


class Asset(models.Model):
    asset_id = models.TextField(
        primary_key=True,
        default=generate_uuid,
        unique=True,
        editable=False
    )
    name = models.TextField(blank=True, null=True)
    uri = models.TextField(blank=True, null=True)
    md5 = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    duration = models.TextField(blank=True, null=True)
    mimetype = models.TextField(blank=True, null=True)
    is_enabled = models.IntegerField(default=0)
    is_processing = models.IntegerField(default=0)
    nocache = models.IntegerField(default=0)
    play_order = models.IntegerField(default=0)
    skip_asset_check = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'assets'

    def __str__(self):
        return self.name

    @property
    def is_active(self):
        current_datetime = timezone.now()
        return 1 if self.start_date < current_datetime < self.end_date else 0
