import json
import uuid

from os import path, rename
from past.builtins import basestring
from dateutil import parser as date_parser
from lib import (
    assets_helper,
    db
)
from lib.utils import (
    download_video_from_youtube,
    get_video_duration,
    validate_url
)
from settings import settings


def prepare_asset(request, unique_name=False):
    data = None

    # For backward compatibility
    try:
        data = json.loads(request.data)
    except ValueError:
        data = json.loads(request.data['model'])
    except TypeError:
        data = json.loads(request.data['model'])

    def get(key):
        val = data.get(key, '')
        if isinstance(val, str):
            return val.strip()
        elif isinstance(val, basestring):
            return val.strip().decode('utf-8')
        else:
            return val

    if not all([get('name'), get('uri'), get('mimetype')]):
        raise Exception("Not enough information provided. Please specify 'name', 'uri', and 'mimetype'.")

    name = get('name')

    if unique_name:
        with db.conn(settings['database']) as conn:
            names = assets_helper.get_names_of_assets(conn)
        if name in names:
            i = 1
            while True:
                new_name = '%s-%i' % (name, i)
                if new_name in names:
                    i += 1
                else:
                    name = new_name
                    break

    asset = {
        'name': name,
        'mimetype': get('mimetype'),
        'asset_id': get('asset_id'),
        'is_enabled': get('is_enabled'),
        'is_processing': get('is_processing'),
        'nocache': get('nocache'),
    }

    uri = get('uri')

    if uri.startswith('/'):
        if not path.isfile(uri):
            raise Exception("Invalid file path. Failed to add asset.")
    else:
        if not validate_url(uri):
            raise Exception("Invalid URL. Failed to add asset.")

    if not asset['asset_id']:
        asset['asset_id'] = uuid.uuid4().hex
        if uri.startswith('/'):
            rename(uri, path.join(settings['assetdir'], asset['asset_id']))
            uri = path.join(settings['assetdir'], asset['asset_id'])

    if 'youtube_asset' in asset['mimetype']:
        uri, asset['name'], asset['duration'] = download_video_from_youtube(uri, asset['asset_id'])
        asset['mimetype'] = 'video'
        asset['is_processing'] = 1

    asset['uri'] = uri

    if "video" in asset['mimetype']:
        if get('duration') == 'N/A' or int(get('duration')) == 0:
            asset['duration'] = int(get_video_duration(uri).total_seconds())
    else:
        # Crashes if it's not an int. We want that.
        asset['duration'] = int(get('duration'))

    asset['skip_asset_check'] = int(get('skip_asset_check')) if int(get('skip_asset_check')) else 0

    # parse date via python-dateutil and remove timezone info
    if get('start_date'):
        asset['start_date'] = date_parser.parse(get('start_date')).replace(tzinfo=None)
    else:
        asset['start_date'] = ""

    if get('end_date'):
        asset['end_date'] = date_parser.parse(get('end_date')).replace(tzinfo=None)
    else:
        asset['end_date'] = ""

    return asset