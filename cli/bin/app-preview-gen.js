#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');

// Import commands
const generateCommand = require('../dist/commands/generate.js').default;
const batchCommand = require('../dist/commands/batch.js').default;
const initCommand = require('../dist/commands/init.js').default;

program
  .name('app-preview-gen')
  .description('CLI tool for generating App Store screenshots with device frames')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a single app preview screenshot')
  .option('-s, --screenshot <path>', 'Path to screenshot image')
  .option('-d, --device <type>', 'Device type (e.g., "iPhone 6.7\\")', 'iPhone 6.7"')
  .option('-t, --title <text>', 'Title text overlay')
  .option('--subtitle <text>', 'Subtitle text overlay')
  .option('--description <text>', 'Description text overlay')
  .option('-o, --output <path>', 'Output filename (relative to output directory)', './preview.jpg')
  .option('--output-dir <path>', 'Output directory (default: ./output)', './output')
  .option('--style <style>', 'Overlay style (gradient, minimal, bold, dark)', 'gradient')
  .option('--title-position <position>', 'Title position (top, center, bottom)', 'top')
  .option('--primary-color <color>', 'Primary color for gradients and styling')
  .option('--secondary-color <color>', 'Secondary color for gradients')
  .option('--bg-color <color>', 'Background color for solid backgrounds')
  .option('--device-position <position>', 'Device position (center, left, right, angled-left, angled-right)', 'center')
  .action(generateCommand);

program
  .command('batch')
  .description('Generate multiple screenshots from a configuration file')
  .option('-c, --config <path>', 'Path to configuration file', './app-previews.json')
  .option('-o, --output-dir <path>', 'Output directory', './previews')
  .action(batchCommand);

program
  .command('init')
  .description('Initialize a new project configuration interactively')
  .option('-n, --name <name>', 'Project name')
  .option('-s, --screenshots <pattern>', 'Screenshot file pattern')
  .action(initCommand);

program.parse();