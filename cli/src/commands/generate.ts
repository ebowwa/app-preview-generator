import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { PreviewRenderer } from '../core/renderer';
import type { GenerateOptions, DeviceType } from '../shared/types/preview-generator';
import { deviceSizes } from '../shared/types/preview-generator';

export default async function generateCommand(options: GenerateOptions): Promise<void> {
  try {
    console.log(chalk.blue('🎨 Generating app preview...'));

    // Validate device type
    const deviceType = options.device.replace(/[^a-z0-9.-]/g, '').toLowerCase();
    const normalizedDeviceType = normalizeDeviceType(deviceType) as DeviceType;

    if (!deviceSizes[normalizedDeviceType]) {
      console.error(chalk.red(`❌ Invalid device type: ${options.device}`));
      console.log(chalk.yellow('Available devices:'));
      Object.entries(deviceSizes).forEach(([key, value]) => {
        console.log(chalk.gray(`  - ${value.name} (${key})`));
      });
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    const outputDir = path.resolve(options.outputDir);
    await fs.mkdir(outputDir, { recursive: true });

    // Create renderer
    const renderer = new PreviewRenderer(normalizedDeviceType);

    // Generate preview
    console.log(chalk.gray(`📱 Device: ${deviceSizes[normalizedDeviceType].name}`));
    console.log(chalk.gray(`🖼️  Screenshot: ${options.screenshot}`));
    console.log(chalk.gray(`📁 Output Directory: ${outputDir}`));

    const resultBuffer = await renderer.generatePreviewFromOptions(options);

    // Write result to organized output directory
    const outputPath = path.join(outputDir, path.basename(options.output));
    await fs.writeFile(outputPath, resultBuffer);

    console.log(chalk.green(`✅ Preview generated successfully!`));
    console.log(chalk.gray(`📁 Saved to: ${outputPath}`));

  } catch (error) {
    console.error(chalk.red('❌ Error generating preview:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

function normalizeDeviceType(deviceType: string): string {
  const deviceMap: Record<string, string> = {
    'iphone-6.9': 'iphone-69',
    'iphone-6.7': 'iphone-67',
    'iphone-6.5': 'iphone-65',
    'iphone-6.1': 'iphone-61',
    'iphone-69-landscape': 'iphone-69-landscape',
    'ipad-12.9': 'ipad-129',
    'ipad-11': 'ipad-11',
  };

  return deviceMap[deviceType] || deviceType;
}