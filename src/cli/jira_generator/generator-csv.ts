import { Epic, isBacklog, isEpic, Model, } from '../../language/generated/ast.js'
import fs from "fs";
import { createPath} from '../generator-utils.js'
import path from 'path'
import { expandToString, expandToStringWithNL } from 'langium';


export function generateJiraCSV(model: Model, target_folder: string) : void {
    
    fs.mkdirSync(target_folder, {recursive:true})

    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))
   
     const JIRA_PATH = createPath(target_folder,'jira')
    
    fs.writeFileSync(path.join(JIRA_PATH, "/jira-backlog.csv"), createCSV(epics))
}

function createCSV(epics: Epic[],): string {
    return expandToStringWithNL`
    Issue key, Summary,Description,issuetype,Parent
    ${createLinesFromEpic(epics)}
`
}

function createLinesFromEpic(epics: Epic[]): string{
    return expandToString`
    ${epics.map(epic => createLineFromEpic(epic)).join('\n')}
    `
}

function createLineFromEpic(epic: Epic): string{
    
    // Creating a Epic from a process
    if (epic.process){
        return createLineFromEpicProcess(epic)
    }

    const id = epic.id
    const name = epic.name ?? ''
    return printLine(id, name, "description","Epic","")
   
}

function createLineFromEpicProcess (epic: Epic): string{
    const id = epic.id
    const name = epic.name ?? ''
   
    console.log(epic.process?.ref?.name)
    
    return  printLine(id, name, epic.process?.ref?.description ?? '-',"Epic","")
}


function printLine(id: string, name: string, description: string, issueType: string, parent: string){
    return expandToString`
    ${id},"${name}","${description}",${issueType},${parent}`
}
