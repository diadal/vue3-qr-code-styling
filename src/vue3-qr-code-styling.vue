<template>
<div>
   <div ref="vqr" :class="myclass" />
   <button @click="onDownloadClick"  v-if="download" :class="downloadButton">Download</button>
   </div>
</template>

<script lang="ts">
import VQRCodeStyling from './app'

import {
  defineComponent,
  onBeforeUpdate,
  onBeforeUnmount,
  ref,
  onMounted
} from 'vue'

export default defineComponent({

  props: {
    width: {
      type: Number,
      default: 300
    },
    myclass: {
      type: String,
      default: ''
    },
    downloadButton: {
      type: String,
      default: ''
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
    }

  },

  name: 'vue3-qr-code-styling',

  setup (props) {
    const vqr = ref<HTMLElement>()
    const fileExt = ref<string>(props.fileExt)
    const qrCode:any = new VQRCodeStyling({
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

    const onDownloadClick = () => {
      qrCode.download({
        extension: fileExt.value
      })
    }

    onMounted(() => {
      qrCode.append(vqr.value)
    })
    onBeforeUnmount(() => {
      vqr.value = undefined
    })

    onBeforeUpdate(() => {
      vqr.value = undefined
    })
    return {
      qrCode,
      vqr,
      onDownloadClick
    }
  }
})
</script>
