import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'react-use'

const CANVAS_HEIGHT = 720
const CANVAS_WIDTH = 1280
const SCALE_DEFAULT = 1
const SCALE_MAX = 10
const SCALE_MIN = 1
const SCALE_STEP = 0.001
const WHEEL_ACCEL = 0.025

export type MapViewerProps = Readonly<{
  height?: string
  name: string
  url: string
  width?: string
}>

export const MapViewer: React.VFC<MapViewerProps> = ({
  height,
  name,
  url,
  width,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragging, setDragging] = useState(false)
  const [mapHeight, setMapHeight] = useState(0)
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null)
  const [mapWidth, setMapWidth] = useState(0)
  const [mapX, setMapX] = useState(0)
  const [mapY, setMapY] = useState(0)
  const [relX, setRelX] = useState(0)
  const [relY, setRelY] = useState(0)
  const [scale, setScale] = useState(SCALE_DEFAULT)

  const getContext = (): CanvasRenderingContext2D => {
    const canvas = canvasRef.current!

    return canvas.getContext('2d')!
  }

  const getOffsetX = (): number => {
    const canvas = canvasRef.current!

    return canvas.getBoundingClientRect().left
  }

  const getOffsetY = (): number => {
    const canvas = canvasRef.current!

    return canvas.getBoundingClientRect().top
  }

  useEffect(() => {
    const image = new Image()
    image.referrerPolicy = 'no-referrer'
    image.src = url
    image.addEventListener(
      'load',
      () => {
        setMapWidth(image.width)
        setMapHeight(image.height)

        setScale((SCALE_MIN * CANVAS_WIDTH) / image.width)

        setMapImage(image)
      },
      false,
    )
  }, [])

  useDebounce(
    () => {
      if (!mapImage) return

      const ctx = getContext()

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      console.log('draw', scale, mapX, mapY)
      ctx.scale(scale, scale)
      ctx.drawImage(mapImage, mapX, mapY)

      ctx.scale(SCALE_DEFAULT / scale, SCALE_DEFAULT / scale)
    },
    1,
    [mapImage, scale, mapX, mapY],
  )

  const mouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const x = Math.round((e.clientX - getOffsetX()) / scale)
    const y = Math.round((e.clientY - getOffsetY()) / scale)

    if (mapX < x && mapX + mapWidth > x && mapY < y && mapY + mapHeight > y) {
      setDragging(true)
      setRelX(mapX - x)
      setRelY(mapY - y)
    }
  }

  const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const x = Math.round((e.clientX - getOffsetX()) / scale)
    const y = Math.round((e.clientY - getOffsetY()) / scale)

    if (dragging) {
      const nextX = x + relX
      const nextY = y + relY
      const maxX = 0
      const maxY = 0
      const minX = -Math.round(mapWidth - CANVAS_WIDTH / scale)
      const minY = -Math.round(mapHeight - CANVAS_HEIGHT / scale)

      if (maxX <= nextX) setMapX(maxX)
      else if (nextX <= minX) setMapX(minX)
      else setMapX(nextX)

      if (maxY <= nextY) setMapY(maxY)
      else if (nextY <= minY) setMapY(minY)
      else setMapY(nextY)
    }
  }

  const mouseUp = () => setDragging(false)

  const mouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const x = Math.round((e.clientX - getOffsetX()) / scale)
    const y = Math.round((e.clientY - getOffsetY()) / scale)

    const renderScale = CANVAS_WIDTH / mapWidth
    const scaleMax = SCALE_MAX * renderScale
    const scaleMin = SCALE_MIN * renderScale

    const reciprocal = 1 / SCALE_STEP

    const rawScale = scale + e.deltaY * -WHEEL_ACCEL
    const roundedScale = Math.round(rawScale * reciprocal) / reciprocal

    setScale(Math.min(Math.max(scaleMin, roundedScale), scaleMax))
  }

  return (
    <canvas
      height={CANVAS_HEIGHT}
      onMouseDown={mouseDown}
      onMouseMove={mouseMove}
      onMouseUp={mouseUp}
      onWheel={mouseWheel}
      ref={canvasRef}
      //style={{ height, width }}
      width={CANVAS_WIDTH}
    >
      <img src={url} alt={name} referrerPolicy="no-referrer" />
    </canvas>
  )
}
