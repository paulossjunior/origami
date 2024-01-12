import type { Model } from '../language/generated/ast.js';
import * as path from 'node:path';
import {generateJiraCSV} from './jira_generator/generator-csv.js'
import {generateAPI} from './jira_generator/integration-api.js'

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const final_destination = extractDestination(filePath, destination)

    generateJiraCSV(model,final_destination)
    generateAPI(model)
   
    return final_destination;
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')
  
    return destination ?? path.join(path.dirname(filePath), "generated")
  }