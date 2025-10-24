import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import type { InitOptions, CLIConfig } from '../shared/types/preview-generator';
import { deviceSizes } from '../shared/types/preview-generator';

export default async function initCommand(options: InitOptions): Promise<void> {
  try {
    console.log(chalk.blue('🚀 Initializing App Preview Generator project...'));

    // Interactive configuration
    let config: Partial<CLIConfig>;

    if (options.name && options.screenshots) {
      // Use command line options
      config = await createConfigFromOptions(options);
    } else {
      // Interactive mode
      config = await createConfigInteractively();
    }

    const fullConfig: CLIConfig = {
      project: {
        name: config.project?.name || 'My App',
        device: config.project?.device || 'iPhone 6.7"',
        defaultStyle: config.project?.defaultStyle || 'gradient',
        defaultPosition: config.project?.defaultPosition || 'top'
      },
      screens: config.screens || [],
      output: {
        directory: config.output?.directory || './output',
        format: config.output?.format || 'jpg',
        quality: config.output?.quality || 90
      }
    };

    // Write configuration file
    const configPath = './app-previews.json';
    await fs.writeFile(configPath, JSON.stringify(fullConfig, null, 2));

    console.log(chalk.green(`✅ Configuration created: ${configPath}`));
    console.log(chalk.blue('\n📋 Next steps:'));
    console.log(chalk.gray('1. Edit the configuration file to customize your screenshots'));
    console.log(chalk.gray('2. Run: app-preview-gen batch --config app-previews.json'));
    console.log(chalk.gray('3. Or generate individual previews with: app-preview-gen generate'));

  } catch (error) {
    console.error(chalk.red('❌ Error initializing project:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function createConfigFromOptions(options: InitOptions): Promise<Partial<CLIConfig>> {
  // Find screenshot files
  const screenshotFiles = await findScreenshotFiles(options.screenshots!);

  return {
    project: {
      name: options.name!,
      device: 'iPhone 6.7"'
    },
    screens: screenshotFiles.map((file, index) => ({
      screenshot: file,
      title: options.name || 'My App',
      outputName: `screen-${index + 1}.jpg`
    })),
    output: {
      directory: './output',
      format: 'jpg'
    }
  };
}

async function createConfigInteractively(): Promise<Partial<CLIConfig>> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your app name?',
      default: 'My App'
    },
    {
      type: 'list',
      name: 'device',
      message: 'Which device type?',
      choices: Object.entries(deviceSizes).map(([key, value]) => ({
        name: value.name,
        value: key
      })),
      default: 'iphone-67'
    },
    {
      type: 'list',
      name: 'defaultStyle',
      message: 'Default overlay style?',
      choices: [
        { name: 'Gradient', value: 'gradient' },
        { name: 'Minimal', value: 'minimal' },
        { name: 'Bold', value: 'bold' },
        { name: 'Dark', value: 'dark' }
      ],
      default: 'gradient'
    },
    {
      type: 'list',
      name: 'defaultPosition',
      message: 'Default text position?',
      choices: [
        { name: 'Top', value: 'top' },
        { name: 'Center', value: 'center' },
        { name: 'Bottom', value: 'bottom' }
      ],
      default: 'top'
    },
    {
      type: 'input',
      name: 'screenshotsPattern',
      message: 'Screenshot files pattern (glob pattern)',
      default: './screenshots/*.png',
      validate: async (input: string) => {
        try {
          const files = await findScreenshotFiles(input);
          if (files.length === 0) {
            return 'No files found matching this pattern';
          }
          return true;
        } catch (error) {
          return 'Invalid pattern';
        }
      }
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory?',
      default: './output'
    },
    {
      type: 'list',
      name: 'format',
      message: 'Output format?',
      choices: [
        { name: 'JPEG', value: 'jpg' },
        { name: 'PNG', value: 'png' }
      ],
      default: 'jpg'
    }
  ]);

  // Find screenshot files
  const screenshotFiles = await findScreenshotFiles(answers.screenshotsPattern);

  return {
    project: {
      name: answers.projectName,
      device: answers.device,
      defaultStyle: answers.defaultStyle,
      defaultPosition: answers.defaultPosition
    },
    screens: screenshotFiles.map((file, index) => ({
      screenshot: file,
      title: answers.projectName,
      outputName: `screen-${index + 1}.${answers.format}`
    })),
    output: {
      directory: answers.outputDir,
      format: answers.format as 'jpg' | 'png'
    }
  };
}

async function findScreenshotFiles(pattern: string): Promise<string[]> {
  const { glob } = await import('glob');
  const files = await glob(pattern, { ignore: 'node_modules/**' });
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });
}