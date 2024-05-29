from django.urls import path
from .views.v1 import (
    AssetViewV1,
    AssetListViewV1,
    AssetContentView,
    FileAssetView,
    PlaylistOrderView,
    BackupView,
    RecoverView,
    AssetsControlView,
    InfoView,
    ResetWifiConfigView,
    GenerateUsbAssetsKeyView,
    UpgradeScreenlyView,
    RebootScreenlyView,
    ShutdownScreenlyView,
    ViewerCurrentAssetView
)

app_name = 'api'

urlpatterns = [
    path('v1/assets/', AssetListViewV1.as_view(), name='asset_list_v1'),
    path('v1/assets/<str:asset_id>/', AssetViewV1.as_view(), name='asset_detail_v1'),
    path('v1/assets/<str:asset_id>/content/', AssetContentView.as_view(), name='asset_content_v1'),
    path('v1/file_asset', FileAssetView.as_view(), name='file_asset_v1'),
    path('v1/assets/order/', PlaylistOrderView.as_view(), name='playlist_order_v1'),
    path('v1/backup/', BackupView.as_view(), name='backup_v1'),
    path('v1/recover/', RecoverView.as_view(), name='recover_v1'),
    path('v1/assets/control/<str:command>', AssetsControlView.as_view(), name='assets_control_v1'),
    path('v1/info/', InfoView.as_view(), name='info_v1'),
    path('v1/reset_wifi/', ResetWifiConfigView.as_view(), name='reset_wifi_v1'),
    path('v1/generate_usb_assets_key/', GenerateUsbAssetsKeyView.as_view(), name='generate_usb_assets_key_v1'),
    path('v1/upgrade_screenly/', UpgradeScreenlyView.as_view(), name='upgrade_screenly_v1'),
    path('v1/reboot_screenly/', RebootScreenlyView.as_view(), name='reboot_screenly_v1'),
    path('v1/shutdown_screenly', ShutdownScreenlyView.as_view(), name='shutdown_screenly_v1'),
    path('v1/viewer_current_asset', ViewerCurrentAssetView.as_view(), name='viewer_current_asset_v1')
]