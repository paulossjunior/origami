import type { Model } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { OrigamiLanguageMetaData } from '../language/generated/module.js';
import { createOrigamiServices } from '../language/origami-module.js';
import { extractAstNode } from './cli-util.js';
import { generateJavaScript } from './generator.js';
import { NodeFileSystem } from 'langium/node';
//import * as url from 'node:url';
//import * as fs from 'node:fs/promises';
//import * as path from 'node:path';

//const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
//const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createOrigamiServices(NodeFileSystem).Origami;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
    console.log(chalk.green(`Code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);


    const fileExtensions = OrigamiLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('Generate Files')
        .action(generateAction);

    program.parse(process.argv);
}
