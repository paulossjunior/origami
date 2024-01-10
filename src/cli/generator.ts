import path from 'path';
import { Model } from '../language-server/generated/ast';
import { generateJIRACSV } from './jira_generator/main-generator';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const final_destination = extractDestination(filePath, destination)
    
    generateJIRACSV(model,final_destination)
   
    return final_destination;
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')
  
    return destination ?? path.join(path.dirname(filePath), "generated")
  }