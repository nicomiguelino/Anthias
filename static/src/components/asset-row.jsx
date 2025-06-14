import {
  FaDownload,
  FaPencilAlt,
  FaTrashAlt,
  FaGlobe,
  FaImage,
  FaVideo,
} from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'
import Swal from 'sweetalert2'
import classNames from 'classnames'
import { useEffect, forwardRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { css } from '@/utils'

import { toggleAssetEnabled, fetchAssets } from '@/store/assets'
import { SWEETALERT_TIMER } from '@/constants'

const tooltipStyles = css`
  .tooltip {
    opacity: 1;
    transition: opacity 0s ease-in-out;
  }
  .tooltip.fade {
    opacity: 0;
  }
  .tooltip.show {
    opacity: 1;
  }
  .tooltip-inner {
    background-color: #2c3e50;
    color: #fff;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    max-width: 300px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .tooltip.bs-tooltip-top .arrow::before {
    border-top-color: #2c3e50;
  }

  /* SweetAlert2 Custom Styles */
  html.swal2-shown body.swal2-shown {
    overflow-y: auto;
    padding-right: 0;
  }
  .swal2-popup.swal2-modal {
    font-size: 0.875rem;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }
  .swal2-popup .swal2-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
  }
  .swal2-popup .swal2-html-container {
    font-size: 0.875rem;
    color: #6c757d;
  }
  .swal2-popup .swal2-confirm {
    background-color: #dc3545;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1.5rem;
    border-radius: 0.375rem;
  }
  .swal2-popup .swal2-confirm:hover {
    background-color: #c82333;
  }
  .swal2-popup .swal2-cancel {
    background-color: #6c757d;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1.5rem;
    border-radius: 0.375rem;
  }
  .swal2-popup .swal2-cancel:hover {
    background-color: #5a6268;
  }
  .swal2-popup .swal2-actions {
    gap: 0.1rem;
  }
  .swal2-popup .swal2-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.5rem auto;
  }
  .swal2-popup .swal2-icon-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const formatDuration = (seconds) => {
  let durationString = ''
  const secInt = parseInt(seconds)

  const hours = Math.floor(secInt / 3600)
  if (hours > 0) {
    durationString += `${hours} hours `
  }

  const minutes = Math.floor(secInt / 60) % 60
  if (minutes > 0) {
    durationString += `${minutes} min `
  }

  const secs = secInt % 60
  if (secs > 0) {
    durationString += `${secs} sec`
  }

  return durationString
}

const formatDate = (date, dateFormat, use24HourClock = false) => {
  if (!date) return ''

  // Create a Date object from the input date string
  const dateObj = new Date(date)

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return date

  // Extract the separator from the format
  const separator = dateFormat.includes('/')
    ? '/'
    : dateFormat.includes('-')
      ? '-'
      : dateFormat.includes('.')
        ? '.'
        : '/'

  // Extract the format parts from the dateFormat string
  const formatParts = dateFormat.split(/[\/\-\.]/)

  // Set up the date formatting options
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24HourClock, // Use 12-hour format if use24HourClock is false
  }

  // Create a formatter with the specified options
  const formatter = new Intl.DateTimeFormat('en-US', options)

  // Format the date and get the parts
  const formattedParts = formatter.formatToParts(dateObj)

  // Extract the formatted values
  const month = formattedParts.find((p) => p.type === 'month').value
  const day = formattedParts.find((p) => p.type === 'day').value
  const year = formattedParts.find((p) => p.type === 'year').value
  const hour = formattedParts.find((p) => p.type === 'hour').value
  const minute = formattedParts.find((p) => p.type === 'minute').value
  const second = formattedParts.find((p) => p.type === 'second').value

  // Get the period (AM/PM) if using 12-hour format
  let period = ''
  if (!use24HourClock) {
    const periodPart = formattedParts.find((p) => p.type === 'dayPeriod')
    if (periodPart) {
      period = ` ${periodPart.value}`
    }
  }

  // Build the date part according to the format
  let datePart = ''

  // Determine the order based on the format
  if (formatParts[0].includes('mm')) {
    datePart = `${month}${separator}${day}${separator}${year}`
  } else if (formatParts[0].includes('dd')) {
    datePart = `${day}${separator}${month}${separator}${year}`
  } else if (formatParts[0].includes('yyyy')) {
    datePart = `${year}${separator}${month}${separator}${day}`
  } else {
    // Default to mm/dd/yyyy if format is not recognized
    datePart = `${month}${separator}${day}${separator}${year}`
  }

  // Add the time part with AM/PM if using 12-hour format
  const timePart = `${hour}:${minute}:${second}${period}`

  return `${datePart} ${timePart}`
}

const getMimetypeIcon = (mimetype) => {
  if (mimetype.includes('image')) {
    return (
      <FaImage
        className="mr-2 align-middle"
        style={{ verticalAlign: 'middle' }}
      />
    )
  } else if (mimetype.includes('video')) {
    return (
      <FaVideo
        className="mr-2 align-middle"
        style={{ verticalAlign: 'middle' }}
      />
    )
  } else if (mimetype.includes('webpage')) {
    return (
      <FaGlobe
        className="mr-2 align-middle"
        style={{ verticalAlign: 'middle' }}
      />
    )
  } else {
    return (
      <FaGlobe
        className="mr-2 align-middle"
        style={{ verticalAlign: 'middle' }}
      />
    )
  }
}

export const AssetRow = forwardRef((props, ref) => {
  const defaultDateFormat = 'mm/dd/yyyy'
  const dispatch = useDispatch()
  const [isDisabled, setIsDisabled] = useState(false)
  const [dateFormat, setDateFormat] = useState(defaultDateFormat)
  const [use24HourClock, setUse24HourClock] = useState(false)

  useEffect(() => {
    const fetchDateFormat = async () => {
      try {
        const response = await fetch('/api/v2/device_settings')
        const data = await response.json()
        setDateFormat(data.date_format)
        setUse24HourClock(data.use_24_hour_clock)
      } catch (error) {
        setDateFormat(defaultDateFormat)
        setUse24HourClock(false)
      }
    }

    fetchDateFormat()
  }, [])

  const handleToggle = async () => {
    const newValue = !props.isEnabled ? 1 : 0
    setIsDisabled(true)
    try {
      await dispatch(
        toggleAssetEnabled({ assetId: props.assetId, newValue }),
      ).unwrap()
      dispatch(fetchAssets())
    } catch (error) {
    } finally {
      setIsDisabled(false)
    }
  }

  const handleDownload = async (event) => {
    event.preventDefault()
    const assetId = props.assetId

    try {
      const response = await fetch(`/api/v2/assets/${assetId}/content`)
      const result = await response.json()

      if (result.type === 'url') {
        window.open(result.url)
      } else if (result.type === 'file') {
        // Convert base64 to byte array
        const content = atob(result.content)
        const bytes = new Uint8Array(content.length)
        for (let i = 0; i < content.length; i++) {
          bytes[i] = content.charCodeAt(i)
        }

        const mimetype = result.mimetype
        const filename = result.filename

        // Create blob and download
        const blob = new Blob([bytes], { type: mimetype })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        document.body.appendChild(a)
        a.download = filename
        a.href = url
        a.click()

        // Clean up
        URL.revokeObjectURL(url)
        a.remove()
      }
    } catch (error) {}
  }

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
        actions: 'swal2-actions',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Disable the row while deleting
          setIsDisabled(true)

          // Make API call to delete the asset
          const response = await fetch(`/api/v2/assets/${props.assetId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            // Refresh the assets list after successful deletion
            dispatch(fetchAssets())

            // Show success message
            Swal.fire({
              title: 'Deleted!',
              text: 'Asset has been deleted.',
              icon: 'success',
              timer: SWEETALERT_TIMER,
              showConfirmButton: false,
              customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                htmlContainer: 'swal2-html-container',
              },
            })
          } else {
            // Show error message
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete asset.',
              icon: 'error',
              customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                htmlContainer: 'swal2-html-container',
                confirmButton: 'swal2-confirm',
              },
            })
          }
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete asset.',
            icon: 'error',
            customClass: {
              popup: 'swal2-popup',
              title: 'swal2-title',
              htmlContainer: 'swal2-html-container',
              confirmButton: 'swal2-confirm',
            },
          })
        } finally {
          setIsDisabled(false)
        }
      }
    })
  }

  const handleEdit = () => {
    if (props.onEditAsset) {
      props.onEditAsset({
        id: props.assetId,
        name: props.name,
        start_date: props.startDate,
        end_date: props.endDate,
        duration: props.duration,
        uri: props.uri,
        mimetype: props.mimetype,
        is_enabled: props.isEnabled,
        nocache: props.nocache,
        skip_asset_check: props.skipAssetCheck,
      })
    }
  }

  return (
    <>
      <style>{tooltipStyles}</style>
      <tr
        ref={ref}
        style={props.style}
        className={classNames({ warning: isDisabled })}
      >
        <td className={classNames('asset_row_name')}>
          {props.showDragHandle && (
            <span
              {...props.dragHandleProps}
              style={{
                cursor: props.isDragging ? 'grabbing' : 'grab',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              <GiHamburgerMenu
                className="mr-3 align-middle"
                style={{ verticalAlign: 'middle' }}
              />
            </span>
          )}
          {getMimetypeIcon(props.mimetype)}
          <span
            data-toggle="tooltip"
            data-placement="top"
            title={props.name}
            style={{ verticalAlign: 'middle' }}
          >
            {props.name}
          </span>
        </td>
        <td
          style={{ width: '21%', maxWidth: '200px' }}
          className="text-truncate"
          data-toggle="tooltip"
          data-placement="top"
          title={formatDate(props.startDate, dateFormat, use24HourClock)}
        >
          {formatDate(props.startDate, dateFormat, use24HourClock)}
        </td>
        <td
          style={{ width: '21%', maxWidth: '200px' }}
          className="text-truncate"
          data-toggle="tooltip"
          data-placement="top"
          title={formatDate(props.endDate, dateFormat, use24HourClock)}
        >
          {formatDate(props.endDate, dateFormat, use24HourClock)}
        </td>
        <td
          style={{ width: '13%', maxWidth: '150px' }}
          className={classNames('text-truncate')}
          data-toggle="tooltip"
          data-placement="top"
          title={formatDuration(props.duration)}
        >
          {formatDuration(props.duration)}
        </td>
        <td className={classNames('asset-toggle')} style={{ width: '7%' }}>
          <label
            className={classNames(
              'is_enabled-toggle',
              'toggle',
              'switch-light',
              'switch-material',
              'small',
              'm-0',
            )}
          >
            <input
              type="checkbox"
              checked={props.isEnabled}
              onChange={handleToggle}
              disabled={isDisabled || props.isProcessing === 1}
            />
            <span>
              <span className="off"></span>
              <span className="on"></span>
              <a></a>
            </span>
          </label>
        </td>
        <td className={classNames('asset_row_btns')}>
          <button
            className={classNames(
              'download-asset-button',
              'btn',
              'btn-outline-dark',
              'mr-1',
              'd-inline-flex',
              'p-2',
            )}
            type="button"
            disabled={isDisabled}
            onClick={handleDownload}
          >
            <FaDownload />
          </button>
          <button
            className={classNames(
              'edit-asset-button',
              'btn',
              'btn-outline-dark',
              'mr-1',
              'd-inline-flex',
              'p-2',
            )}
            type="button"
            disabled={isDisabled}
            onClick={handleEdit}
          >
            <FaPencilAlt />
          </button>
          <button
            className={classNames(
              'delete-asset-button',
              'btn',
              'btn-outline-dark',
              'd-inline-flex',
              'p-2',
            )}
            type="button"
            onClick={handleDelete}
            disabled={isDisabled}
          >
            <FaTrashAlt />
          </button>
        </td>
      </tr>
    </>
  )
})
