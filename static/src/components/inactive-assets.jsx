import { useSelector } from 'react-redux'
import { selectInactiveAssets } from '@/store/assets'
import { AssetRow } from '@/components/asset-row'

export const InactiveAssetsTable = () => {
  const inactiveAssets = useSelector(selectInactiveAssets)

  return (
    <table className="table">
      <thead className="table-borderless">
        <tr>
          <th className="text-secondary font-weight-normal asset_row_name">
            Name
          </th>
          <th
            className="text-secondary font-weight-normal"
            style={{ width: '21%' }}
          >
            Start
          </th>
          <th
            className="text-secondary font-weight-normal"
            style={{ width: '21%' }}
          >
            End
          </th>
          <th
            className="text-secondary font-weight-normal"
            style={{ width: '13%' }}
          >
            Duration
          </th>
          <th
            className="text-secondary font-weight-normal"
            style={{ width: '7%' }}
          >
            Activity
          </th>
          <th
            className="text-secondary font-weight-normal"
            style={{ width: '13%' }}
          ></th>
        </tr>
      </thead>
      <tbody id="inactive-assets">
        {inactiveAssets.map((asset) => (
          <AssetRow
            key={asset.asset_id}
            name={asset.name}
            startDate={asset.start_date}
            endDate={asset.end_date}
            duration={asset.duration}
            isEnabled={asset.is_enabled}
            assetId={asset.asset_id}
            isProcessing={asset.is_processing}
          />
        ))}
      </tbody>
    </table>
  )
}
