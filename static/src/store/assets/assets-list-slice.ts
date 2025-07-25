import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAssets,
  updateAssetOrder,
  toggleAssetEnabled,
} from '@/store/assets/assets-thunks'
import { Asset, RootState } from '@/types'

const initialState: RootState['assets'] = {
  items: [] as Asset[],
  status: 'idle' as const,
  error: null as string | null,
}

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    addAsset: (state, action) => {
      state.items.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch assets'
      })
      .addCase(updateAssetOrder.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(toggleAssetEnabled.fulfilled, (state, action) => {
        const { assetId, newValue, playOrder } = action.payload
        const asset = state.items.find((item) => item.asset_id === assetId)
        if (asset) {
          asset.is_enabled = newValue
          asset.play_order = playOrder
        }
      })
  },
})

export const { addAsset } = assetsSlice.actions

export default assetsSlice.reducer
