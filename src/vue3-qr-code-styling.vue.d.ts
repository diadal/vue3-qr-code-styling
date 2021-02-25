import VQRCodeStyling from "./index";
declare const _default: import("vue").DefineComponent<
  {
    width: {
      type: NumberConstructor;
      default: number;
    };
    myclass: {
      type: StringConstructor;
      default: string;
    };
    downloadButton: {
      type: StringConstructor;
      default: string;
    };
    height: {
      type: NumberConstructor;
      default: number;
    };
    data: {
      type: StringConstructor;
      required: true;
    };
    image: {
      type: StringConstructor;
      default: string;
    };
    qrOptions: {
      type: ObjectConstructor;
      default: () => {
        typeNumber: number;
        mode: string;
        errorCorrectionLevel: string;
      };
    };
    imageOptions: {
      type: ObjectConstructor;
      default: () => {
        hideBackgroundDots: boolean;
        imageSize: number;
        margin: number;
      };
    };
    dotsOptions: {
      type: ObjectConstructor;
      default: () => {
        type: string;
        color: string;
        gradient: {
          type: string;
          rotation: number;
          colorStops: {
            offset: number;
            color: string;
          }[];
        };
      };
    };
    backgroundOptions: {
      type: ObjectConstructor;
      default: () => {
        color: string;
      };
    };
    cornersSquareOptions: {
      type: ObjectConstructor;
      default: () => {
        type: string;
        color: string;
      };
    };
    cornersDotOptions: {
      type: ObjectConstructor;
      default: () => {
        type: undefined;
        color: string;
      };
    };
    fileExt: {
      type: StringConstructor;
      default: string;
    };
    download: {
      type: BooleanConstructor;
      default: boolean;
    };
  },
  {
    qrCode: VQRCodeStyling;
    vqr: import("vue").Ref<HTMLElement | undefined>;
    onDownloadClick: () => void;
  },
  unknown,
  {},
  {},
  import("vue").ComponentOptionsMixin,
  import("vue").ComponentOptionsMixin,
  Record<string, any>,
  string,
  import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps,
  Readonly<
    {
      width: number;
      myclass: string;
      downloadButton: string;
      height: number;
      data: string;
      image: string;
      qrOptions: Record<string, any>;
      imageOptions: Record<string, any>;
      dotsOptions: Record<string, any>;
      backgroundOptions: Record<string, any>;
      cornersSquareOptions: Record<string, any>;
      cornersDotOptions: Record<string, any>;
      fileExt: string;
      download: boolean;
    } & {}
  >,
  {
    width: number;
    myclass: string;
    downloadButton: string;
    height: number;
    image: string;
    qrOptions: Record<string, any>;
    imageOptions: Record<string, any>;
    dotsOptions: Record<string, any>;
    backgroundOptions: Record<string, any>;
    cornersSquareOptions: Record<string, any>;
    cornersDotOptions: Record<string, any>;
    fileExt: string;
    download: boolean;
  }
>;
export default _default;
