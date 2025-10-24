import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { PreviewRenderer } from '../core/renderer';
import type { BatchOptions, CLIConfig, DeviceType } from '../shared/types/preview-generator';
import { deviceSizes } from '../shared/types/preview-generator';

export default async function batchCommand(options: BatchOptions): Promise<void> {
  try {
    console.log(chalk.blue('📦 Generating app previews in batch...'));

    // Load configuration
    const configPath = path.resolve(options.config);
    console.log(chalk.gray(`📋 Loading config: ${configPath}`));

    const configData = await fs.readFile(configPath, 'utf-8');
    const config: CLIConfig = JSON.parse(configData);

    // Validate config
    if (!config.screens || config.screens.length === 0) {
      throw new Error('No screens found in configuration');
    }

    // Ensure output directory exists with organized structure
    const outputDir = path.resolve(options.outputDir);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(chalk.gray(`📱 Device: ${config.project.device}`));
    console.log(chalk.gray(`🎨 Style: ${config.project.defaultStyle || 'default'}`));
    console.log(chalk.gray(`📁 Output: ${outputDir}`));
    console.log(chalk.gray(`📄 Screens: ${config.screens.length}`));

    let successCount = 0;
    let errorCount = 0;

    // Process each screen
    for (let i = 0; i < config.screens.length; i++) {
      const screen = config.screens[i];
      try {
        console.log(chalk.blue(`\n🖼️  Processing screen ${i + 1}/${config.screens.length}: ${screen.screenshot}`));

        // Check if screenshot exists
        const screenshotPath = path.resolve(screen.screenshot);
        await fs.access(screenshotPath);

        // Generate output filename
        const outputName = screen.outputName || `screen-${i + 1}.${config.output.format}`;
        const outputPath = path.join(outputDir, outputName);

        // Create renderer for this screen
        const deviceType = normalizeDeviceType(config.project.device) as DeviceType;
        const renderer = new PreviewRenderer(deviceType);

        // Generate preview
        const generateOptions = {
          screenshot: screenshotPath,
          device: deviceType,
          title: screen.title,
          subtitle: screen.subtitle,
          description: screen.description,
          output: outputPath,
          outputDir: outputDir,
          style: screen.style || config.project.defaultStyle || 'gradient',
          titlePosition: screen.position || config.project.defaultPosition || 'top'
        };

        const resultBuffer = await renderer.generatePreviewFromOptions(generateOptions);
        await fs.writeFile(outputPath, resultBuffer);

        console.log(chalk.green(`  ✅ Generated: ${outputName}`));
        successCount++;

      } catch (error) {
        console.error(chalk.red(`  ❌ Failed to process ${screen.screenshot}:`));
        console.error(chalk.red(`    ${error instanceof Error ? error.message : String(error)}`));
        errorCount++;
      }
    }

    // Summary
    console.log(chalk.blue('\n📊 Batch processing complete!'));
    console.log(chalk.green(`✅ Successful: ${successCount}`));
    if (errorCount > 0) {
      console.log(chalk.red(`❌ Failed: ${errorCount}`));
    }

  } catch (error) {
    console.error(chalk.red('❌ Error in batch processing:'));
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