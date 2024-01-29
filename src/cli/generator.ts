import type { Model } from '../language/generated/ast.js';
import * as path from 'node:path';
import {APIApplication} from './jira_generator/api_application.js'
import { MarkdownApplication } from './markdown_generator/markdown_application.js';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const final_destination = extractDestination(filePath, destination)
    
    APIApplication(model,final_destination)
    MarkdownApplication(model,final_destination)
   
    return final_destination;
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')
  
    return destination ?? path.join(path.dirname(filePath), "generated")
  }