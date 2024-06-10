from django.utils import timezone
from rest_framework.serializers import (
    CharField,
    DateTimeField,
    IntegerField,
    ModelSerializer,
    Serializer,
    SerializerMethodField,
)
from anthias_app.models import Asset


class AssetRequestSerializer(Serializer):
    name = CharField()
    uri = CharField()
    start_date = DateTimeField(default_timezone=timezone.utc)
    end_date = DateTimeField(default_timezone=timezone.utc)
    duration = CharField()
    mimetype = CharField()
    is_enabled = IntegerField(min_value=0, max_value=1)
    nocache = IntegerField()
    play_order = IntegerField()
    skip_asset_check = IntegerField(min_value=0, max_value=1)


class AssetSerializer(ModelSerializer):
    is_active = SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'asset_id',
            'name',
            'uri',
            'start_date',
            'end_date',
            'duration',
            'mimetype',
            'is_active',
            'is_enabled',
            'is_processing',
            'nocache',
            'play_order',
            'skip_asset_check',
        ]
