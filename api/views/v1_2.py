from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.helpers import prepare_asset_v1_2, update_asset
from lib import assets_helper, db
from lib.utils import url_fails
from os import remove
from settings import settings


# @TODO: Use the following decorators: authorized, swagger
class AssetListViewV1_2(APIView):
    def get(self, request):
        with db.conn(settings['database']) as conn:
            result = assets_helper.read(conn)
            return Response(result)

    def post(self, request):
        asset = prepare_asset_v1_2(request, unique_name=True)

        if not asset['skip_asset_check'] and url_fails(asset['uri']):
            raise Exception("Could not retrieve file. Check the asset URL.")
        with db.conn(settings['database']) as conn:
            assets = assets_helper.read(conn)
            ids_of_active_assets = [x['asset_id'] for x in assets if x['is_active']]

            asset = assets_helper.create(conn, asset)

            if asset['is_active']:
                ids_of_active_assets.insert(asset['play_order'], asset['asset_id'])
            assets_helper.save_ordering(conn, ids_of_active_assets)

            result = assets_helper.read(conn, asset['asset_id'])
            return Response(result, status=status.HTTP_201_CREATED)


# @TODO: Use the following decorators: api_response, authorized, swagger
class AssetViewV1_2(APIView):
    def get(self, request, asset_id):
        with db.conn(settings['database']) as conn:
            result = assets_helper.read(conn, asset_id)
            return Response(result)

    def patch(self, request, asset_id):

        with db.conn(settings['database']) as conn:

            asset = assets_helper.read(conn, asset_id)
            if not asset:
                raise Exception('Asset not found.')
            update_asset(asset, request.data)

            assets = assets_helper.read(conn)
            ids_of_active_assets = [x['asset_id'] for x in assets if x['is_active']]

            asset = assets_helper.update(conn, asset_id, asset)

            try:
                ids_of_active_assets.remove(asset['asset_id'])
            except ValueError:
                pass
            if asset['is_active']:
                ids_of_active_assets.insert(asset['play_order'], asset['asset_id'])

            assets_helper.save_ordering(conn, ids_of_active_assets)

            result = assets_helper.read(conn, asset_id)
            return Response(result)

    def put(self, request, asset_id):
        asset = prepare_asset_v1_2(request, asset_id)
        with db.conn(settings['database']) as conn:
            assets = assets_helper.read(conn)
            ids_of_active_assets = [x['asset_id'] for x in assets if x['is_active']]

            asset = assets_helper.update(conn, asset_id, asset)

            try:
                ids_of_active_assets.remove(asset['asset_id'])
            except ValueError:
                pass
            if asset['is_active']:
                ids_of_active_assets.insert(asset['play_order'], asset['asset_id'])

            assets_helper.save_ordering(conn, ids_of_active_assets)
            result = assets_helper.read(conn, asset_id)
            return Response(result)

    def delete(self, request, asset_id):
        with db.conn(settings['database']) as conn:
            asset = assets_helper.read(conn, asset_id)
            try:
                if asset['uri'].startswith(settings['assetdir']):
                    remove(asset['uri'])
            except OSError:
                pass
            assets_helper.delete(conn, asset_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
