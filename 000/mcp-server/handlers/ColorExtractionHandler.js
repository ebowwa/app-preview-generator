/**
 * Color Extraction Handler - Single Responsibility: Extracting color palettes from images
 */
export class ColorExtractionHandler {
  constructor(storage) {
    this.storage = storage;
  }

  async execute(args) {
    const { image_base64, style } = args;
    
    if (!image_base64) {
      throw new Error('image_base64 is required');
    }

    const imageFile = await this.storage.saveImage(image_base64);

    return {
      action: 'EXTRACT_COLORS',
      data: {
        path: imageFile.path,
        style: style || 'auto',
        prompt: `Extract a color palette from the screenshot at ${imageFile.path}. Style preference: ${style || 'auto'}`,
        format: 'json'
      }
    };
  }
}