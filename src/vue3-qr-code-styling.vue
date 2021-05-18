<template>
  <div>
    <div v-if="imageUrl" :class="myclass">
      <img :src="imageUrl" :class="imgclass" />
    </div>
    <div v-if="download">
      <button @click="onDownloadClick" :class="downloadButton">
        {{ ButtonName }}
      </button>
      <br />
      <br />
    </div>
  </div>
</template>

<script lang="ts">
import VQRCodeStyling from './app'

import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import QRCodeStyling from './core/QRCodeStyling'

export default defineComponent({
  props: {
    width: {
      type: Number,
      default: 300
    },
    imgclass: {
      type: String,
      default: ''
    },
    myclass: {
      type: String,
      default: ''
    },
    downloadButton: {
      type: String,
      default: ''
    },
    ButtonName: {
      type: String,
      default: 'Download'
    },
    height: {
      type: Number,
      default: 300
    },
    data: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    qrOptions: {
      type: Object,
      default: () => ({
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'Q'
      })
    },
    imageOptions: {
      type: Object,
      default: () => ({ hideBackgroundDots: true, imageSize: 0.4, margin: 0 })
    },
    dotsOptions: {
      type: Object,
      default: () => ({
        type: 'dots',
        color: '#6a1a4c',
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#6a1a4c' },
            { offset: 1, color: '#6a1a4c' }
          ]
        }
      })
    },
    backgroundOptions: {
      type: Object,
      default: () => ({ color: '#ffffff' })
    },
    cornersSquareOptions: {
      type: Object,
      default: () => ({ type: 'dot', color: '#000000' })
    },
    cornersDotOptions: {
      type: Object,
      default: () => ({ type: undefined, color: '#000000' })
    },
    fileExt: {
      type: String,
      default: 'png'
    },
    download: {
      type: Boolean,
      default: false
    },

    downloadOptions: {
      type: Object,
      default: () => ({ name: 'vqr', extension: 'png' })
    }
  },

  name: 'vue3-qr-code-styling',

  setup(props) {
    const fileExt = ref<string>(props.fileExt)
    const qrCode: QRCodeStyling = new VQRCodeStyling({
      width: props.width,
      height: props.height,
      data: props.data,
      qrOptions: props.qrOptions,
      imageOptions: props.imageOptions,
      dotsOptions: props.dotsOptions,
      backgroundOptions: props.backgroundOptions,
      image: props.image,
      cornersSquareOptions: props.cornersSquareOptions,
      cornersDotOptions: props.cornersDotOptions
    })

    const imageUrl = ref<string>('')

    const onDownloadClick = () => {
      qrCode.download(props.downloadOptions)
    }

    onMounted(async () => {
      imageUrl.value = await qrCode.getImageUrl(fileExt.value)
    })

    onBeforeUnmount(() => {
      imageUrl.value = ''
    })
    return {
      qrCode,
      onDownloadClick,
      imageUrl
    }
  }
})
</script>
