export interface Screenshot {
    id: string;
    url: string;
    position: {
        x: number;
        y: number;
        scale: number;
        rotation: number;
    };
    opacity: number;
    zIndex: number;
}
export interface ImageAsset {
    id: string;
    url: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    rotation: number;
    opacity: number;
    zIndex: number;
}
export interface Screen {
    id: string;
    screenshot: string | null;
    screenshots: Screenshot[];
    title: string;
    subtitle: string;
    description: string;
    overlayStyle: 'none' | 'gradient' | 'minimal' | 'bold' | 'dark';
    textPosition: 'top' | 'center' | 'bottom';
    devicePosition: 'center' | 'left' | 'right' | 'angled-left' | 'angled-right';
    bgStyle: 'solid' | 'gradient' | 'pattern';
    layoutStyle: 'standard' | 'floating' | 'split';
    position: {
        x: number;
        y: number;
        scale: number;
        rotation: number;
    };
    textOverlayPosition: {
        x: number;
        y: number;
    };
    opacity: {
        screenshot: number;
        overlay: number;
    };
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    layerOrder: 'front' | 'back';
    imageAssets: ImageAsset[];
}
export interface DeviceSize {
    width: number;
    height: number;
    name: string;
}
export type DeviceType = 'iphone-69' | 'iphone-67' | 'iphone-65' | 'iphone-61' | 'iphone-69-landscape' | 'ipad-129' | 'ipad-11';
export declare const deviceSizes: Record<DeviceType, DeviceSize>;
export interface CLIConfig {
    project: {
        name: string;
        device: string;
        defaultStyle?: string;
        defaultPosition?: string;
    };
    screens: CLIScreen[];
    output: {
        directory: string;
        format: 'jpg' | 'png';
        quality?: number;
    };
}
export interface CLIScreen {
    screenshot: string;
    title?: string;
    subtitle?: string;
    description?: string;
    style?: string;
    position?: string;
    outputName?: string;
}
export interface GenerateOptions {
    screenshot: string;
    device: string;
    title?: string;
    subtitle?: string;
    description?: string;
    output: string;
    style: string;
    titlePosition: string;
}
export interface BatchOptions {
    config: string;
    outputDir: string;
}
export interface InitOptions {
    name?: string;
    screenshots?: string;
}
//# sourceMappingURL=preview-generator.d.ts.map