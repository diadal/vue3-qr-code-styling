<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import VQRCodeStyling from "./app";
import type QRCodeStyling from "./core/QRCodeStyling";
import type { Options } from "./core/QROptions";

type DownloadOptions = {
  name?: string;
  extension?: string;
};

const props = withDefaults(
  defineProps<{
    width?: number;
    imgclass?: string;
    myclass?: string;
    downloadButton?: string;
    buttonName?: string;
    height?: number;
    data: string;
    image?: string;
    qrOptions?: Options["qrOptions"];
    imageOptions?: Options["imageOptions"];
    dotsOptions?: Options["dotsOptions"];
    backgroundOptions?: Options["backgroundOptions"];
    cornersSquareOptions?: Options["cornersSquareOptions"];
    cornersDotOptions?: Options["cornersDotOptions"];
    fileExt?: string;
    download?: boolean;
    downloadOptions?: DownloadOptions;
  }>(),
  {
    width: 300,
    imgclass: "",
    myclass: "",
    downloadButton: "",
    buttonName: "Download",
    height: 300,
    image: "",
    qrOptions: () => ({
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q"
    }),
    imageOptions: () => ({ hideBackgroundDots: true, imageSize: 0.4, margin: 0 }),
    dotsOptions: () => ({
      type: "dots",
      color: "#6a1a4c",
      gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
          { offset: 0, color: "#6a1a4c" },
          { offset: 1, color: "#6a1a4c" }
        ]
      }
    }),
    backgroundOptions: () => ({ color: "#ffffff" }),
    cornersSquareOptions: () => ({ type: "dot", color: "#000000" }),
    cornersDotOptions: () => ({ type: undefined, color: "#000000" }),
    fileExt: "png",
    download: false,
    downloadOptions: () => ({ name: "vqr", extension: "png" })
  }
);

const fileExt = ref<string>(props.fileExt);

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
});

const imageUrl = ref<string>("");

const onDownloadClick = (): void => {
  qrCode.download(props.downloadOptions);
};

onMounted(async () => {
  imageUrl.value = await qrCode.getImageUrl(fileExt.value);
});

onBeforeUnmount(() => {
  imageUrl.value = "";
});

defineExpose({ qrCode, onDownloadClick, imageUrl });
</script>

<template>
  <div>
    <div v-if="imageUrl" :class="myclass">
      <img :src="imageUrl" :class="imgclass" alt="qr" />
    </div>
    <div v-if="download">
      <button :class="downloadButton" @click="onDownloadClick">
        {{ buttonName }}
      </button>
      <br />
      <br />
    </div>
  </div>
</template>
