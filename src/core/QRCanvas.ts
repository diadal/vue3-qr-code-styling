import calculateImageSize from '../tools/calculateImageSize'
import errorCorrectionPercents from '../constants/errorCorrectionPercents'
import QRDot from './QRDot'
import QRCornerSquare from './QRCornerSquare'
import QRCornerDot from './QRCornerDot'
import { RequiredOptions, Gradient } from './QROptions'
import gradientTypes from '../constants/gradientTypes'
import { QRCode } from '../types'

type FilterFunction = (i: number, j: number) => boolean;
type StyleOptions = {
  color?: string;
  gradient?: Gradient;
};

const squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
]

const dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
]

export default class QRCanvas {
  _canvas: HTMLCanvasElement;
  _options: RequiredOptions;
  _qr?: QRCode;
  _image?: HTMLImageElement;

  constructor (options: RequiredOptions) {
    this._canvas = document.createElement('canvas')
    this._canvas.width = options.width
    this._canvas.height = options.height
    this._options = options
  }

  get context (): CanvasRenderingContext2D | null {
    return this._canvas.getContext('2d')
  }

  get width (): number {
    return this._canvas.width
  }

  get height (): number {
    return this._canvas.height
  }

  getCanvas (): HTMLCanvasElement {
    return this._canvas
  }

  clear (): void {
    const canvasContext = this.context

    if (canvasContext) {
      canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }
  }

  async drawQR (qr: QRCode): Promise<void> {
    const count = qr.getModuleCount()
    const minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2
    const dotSize = Math.floor(minSize / count)
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    }

    this._qr = qr

    if (this._options.image) {
      await this.loadImage()
      if (!this._image) return
      const { imageOptions, qrOptions } = this._options
      const coverLevel = imageOptions.imageSize * errorCorrectionPercents[qrOptions.errorCorrectionLevel]
      const maxHiddenDots = Math.floor(coverLevel * count * count)

      drawImageSize = calculateImageSize({
        originalWidth: this._image.width,
        originalHeight: this._image.height,
        maxHiddenDots,
        maxHiddenAxisDots: count - 14,
        dotSize
      })
    }

    this.clear()
    this.drawBackground()
    this.drawDots((i: number, j: number): boolean => {
      if (this._options.imageOptions.hideBackgroundDots) {
        if (
          i >= (count - drawImageSize.hideXDots) / 2 &&
          i < (count + drawImageSize.hideXDots) / 2 &&
          j >= (count - drawImageSize.hideYDots) / 2 &&
          j < (count + drawImageSize.hideYDots) / 2
        ) {
          return false
        }
      }

      if (squareMask[i]?.[j] || squareMask[i - count + 7]?.[j] || squareMask[i]?.[j - count + 7]) {
        return false
      }

      if (dotMask[i]?.[j] || dotMask[i - count + 7]?.[j] || dotMask[i]?.[j - count + 7]) {
        return false
      }

      return true
    })
    this.drawCorners()

    if (this._options.image) {
      this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize })
    }
  }

  drawBackground (): void {
    const canvasContext = this.context
    const options = this._options

    if (canvasContext) {
      if (options.backgroundOptions.gradient) {
        const gradientOptions = options.backgroundOptions.gradient
        const gradient = this._createGradient({
          context: canvasContext,
          options: gradientOptions,
          additionalRotation: 0,
          x: 0,
          y: 0,
          size: Math.max(this._canvas.width, this._canvas.height)
        })

        gradientOptions.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
          gradient.addColorStop(offset, color)
        })

        canvasContext.fillStyle = gradient
      } else if (options.backgroundOptions.color) {
        canvasContext.fillStyle = options.backgroundOptions.color
      }
      canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)
    }
  }

  drawDots (filter?: FilterFunction): void {
    if (!this._qr) {
      throw new Error('QR code is not defined')
    }

    const canvasContext = this.context

    if (!canvasContext) {
      throw new Error('QR code is not defined')
    }

    const options = this._options
    const count = this._qr.getModuleCount()

    if (count > options.width || count > options.height) {
      throw new Error('The canvas is too small.')
    }

    const minSize = Math.min(options.width, options.height) - options.margin * 2
    const dotSize = Math.floor(minSize / count)
    const xBeginning = Math.floor((options.width - count * dotSize) / 2)
    const yBeginning = Math.floor((options.height - count * dotSize) / 2)
    const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type })

    canvasContext.beginPath()

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (filter && !filter(i, j)) {
          continue
        }
        if (!this._qr.isDark(i, j)) {
          continue
        }
        dot.draw(
          xBeginning + i * dotSize,
          yBeginning + j * dotSize,
          dotSize,
          (xOffset: number, yOffset: number): boolean => {
            if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count) return false
            if (filter && !filter(i + xOffset, j + yOffset)) return false
            return !!this._qr && this._qr.isDark(i + xOffset, j + yOffset)
          }
        )
      }
    }

    if (options.dotsOptions.gradient) {
      const gradientOptions = options.dotsOptions.gradient
      const gradient = this._createGradient({
        context: canvasContext,
        options: gradientOptions,
        additionalRotation: 0,
        x: xBeginning,
        y: yBeginning,
        size: count * dotSize
      })

      gradientOptions.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
        gradient.addColorStop(offset, color)
      })

      canvasContext.fillStyle = canvasContext.strokeStyle = gradient
    } else if (options.dotsOptions.color) {
      canvasContext.fillStyle = canvasContext.strokeStyle = options.dotsOptions.color
    }

    canvasContext.fill('evenodd')
  }

  drawCorners (filter?: FilterFunction): void {
    if (!this._qr) {
      throw new Error('QR code is not defined')
    }

    const canvasContext = this.context

    if (!canvasContext) {
      throw new Error('QR code is not defined')
    }

    const options = this._options

    const count = this._qr.getModuleCount()
    const minSize = Math.min(options.width, options.height) - options.margin * 2
    const dotSize = Math.floor(minSize / count)
    const cornersSquareSize = dotSize * 7
    const cornersDotSize = dotSize * 3
    const xBeginning = Math.floor((options.width - count * dotSize) / 2)
    const yBeginning = Math.floor((options.height - count * dotSize) / 2)

    const corners: [number, number, number][] = [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ]

    corners.forEach(([column, row, rotation]) => {
      if (filter && !filter(column, row)) {
        return
      }

      const x = xBeginning + column * dotSize * (count - 7)
      const y = yBeginning + row * dotSize * (count - 7)

      this._drawCornerSquare(canvasContext, x, y, dotSize, cornersSquareSize, rotation)
      this._drawCornerDot(canvasContext, x, y, dotSize, cornersDotSize, rotation)
    })
  }

  _drawCornerSquare (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    dotSize: number,
    size: number,
    rotation: number
  ): void {
    const { cornersSquareOptions, dotsOptions } = this._options

    context.beginPath()

    if (cornersSquareOptions?.type) {
      const cornersSquare = new QRCornerSquare({ context, type: cornersSquareOptions.type })
      cornersSquare.draw(x, y, size, rotation)
    } else {
      const dot = new QRDot({ context, type: dotsOptions.type })
      this._drawMask(squareMask, dot, x, y, dotSize)
    }

    this._applyStyle(context, cornersSquareOptions, { additionalRotation: rotation, x, y, size })
    context.fill('evenodd')
  }

  _drawCornerDot (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    dotSize: number,
    size: number,
    rotation: number
  ): void {
    const { cornersDotOptions, dotsOptions } = this._options

    context.beginPath()

    if (cornersDotOptions?.type) {
      const cornersDot = new QRCornerDot({ context, type: cornersDotOptions.type })
      cornersDot.draw(x + dotSize * 2, y + dotSize * 2, size, rotation)
    } else {
      const dot = new QRDot({ context, type: dotsOptions.type })
      this._drawMask(dotMask, dot, x, y, dotSize)
    }

    this._applyStyle(context, cornersDotOptions, {
      additionalRotation: rotation,
      x: x + dotSize * 2,
      y: y + dotSize * 2,
      size
    })
    context.fill('evenodd')
  }

  _drawMask (mask: number[][], dot: QRDot, x: number, y: number, dotSize: number): void {
    for (let i = 0; i < mask.length; i++) {
      for (let j = 0; j < mask[i].length; j++) {
        if (!mask[i]?.[j]) {
          continue
        }

        dot.draw(
          x + i * dotSize,
          y + j * dotSize,
          dotSize,
          (xOffset: number, yOffset: number): boolean => !!mask[i + xOffset]?.[j + yOffset]
        )
      }
    }
  }

  _applyStyle (
    context: CanvasRenderingContext2D,
    style: StyleOptions | undefined,
    gradientArgs: { additionalRotation: number; x: number; y: number; size: number }
  ): void {
    if (style?.gradient) {
      const gradient = this._createGradient({ context, options: style.gradient, ...gradientArgs })

      style.gradient.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
        gradient.addColorStop(offset, color)
      })

      context.fillStyle = context.strokeStyle = gradient
    } else if (style?.color) {
      context.fillStyle = context.strokeStyle = style.color
    }
  }

  loadImage (): Promise<void> {
    return new Promise((resolve, reject) => {
      const options = this._options
      const image = new Image()

      if (!options.image) {
        return reject(new Error('Image is not defined'))
      }

      if (typeof options.imageOptions.crossOrigin === 'string') {
        image.crossOrigin = options.imageOptions.crossOrigin
      }

      this._image = image
      image.onload = (): void => {
        resolve()
      }
      image.src = options.image
    })
  }

  drawImage ({
    width,
    height,
    count,
    dotSize
  }: {
    width: number;
    height: number;
    count: number;
    dotSize: number;
  }): void {
    const canvasContext = this.context

    if (!canvasContext) {
      throw new Error('canvasContext is not defined')
    }

    if (!this._image) {
      throw new Error('image is not defined')
    }

    const options = this._options
    const xBeginning = Math.floor((options.width - count * dotSize) / 2)
    const yBeginning = Math.floor((options.height - count * dotSize) / 2)
    const dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2
    const dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2
    const dw = width - options.imageOptions.margin * 2
    const dh = height - options.imageOptions.margin * 2

    canvasContext.drawImage(this._image, dx, dy, Math.max(dw, 0), Math.max(dh, 0))
  }

  _createGradient ({
    context,
    options,
    additionalRotation,
    x,
    y,
    size
  }: {
    context: CanvasRenderingContext2D;
    options: Gradient;
    additionalRotation: number;
    x: number;
    y: number;
    size: number;
  }): CanvasGradient {
    let gradient

    if (options.type === gradientTypes.radial) {
      gradient = context.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size / 2)
    } else {
      const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI)
      const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI)
      let x0 = x + size / 2
      let y0 = y + size / 2
      let x1 = x + size / 2
      let y1 = y + size / 2

      if (
        (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
        (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)
      ) {
        x0 = x0 - size / 2
        y0 = y0 - (size / 2) * Math.tan(rotation)
        x1 = x1 + size / 2
        y1 = y1 + (size / 2) * Math.tan(rotation)
      } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
        y0 = y0 - size / 2
        x0 = x0 - size / 2 / Math.tan(rotation)
        y1 = y1 + size / 2
        x1 = x1 + size / 2 / Math.tan(rotation)
      } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
        x0 = x0 + size / 2
        y0 = y0 + (size / 2) * Math.tan(rotation)
        x1 = x1 - size / 2
        y1 = y1 - (size / 2) * Math.tan(rotation)
      } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
        y0 = y0 + size / 2
        x0 = x0 + size / 2 / Math.tan(rotation)
        y1 = y1 - size / 2
        x1 = x1 - size / 2 / Math.tan(rotation)
      }

      gradient = context.createLinearGradient(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1))
    }

    return gradient
  }
}
