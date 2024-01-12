import { Epic, AtomicUserStory, isAtomicUserStory, isBacklog, isEpic, Model, isTaksBacklog, TaksBacklog, isProcess, Process } from '../../language/generated/ast.js'
import fs from "fs";
import { createPath} from '../generator-utils.js'
import path from 'path'
import { expandToString, expandToStringWithNL } from 'langium';


export function generateJiraCSV(model: Model, target_folder: string) : void {
    
    fs.mkdirSync(target_folder, {recursive:true})

    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))

    const userStories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))

    const tasks = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaksBacklog))

     
     const JIRA_PATH = createPath(target_folder,'jira')
    
    fs.writeFileSync(path.join(JIRA_PATH, "/jira-backlog.csv"), createCSV(epics,userStories,tasks)
}

function createCSV(epics: Epic[],atomicUserStories: AtomicUserStory[], tasks: TaksBacklog[],): string {
    return expandToStringWithNL`
    Issue key, Summary,Description,issuetype,Parent
    ${createLinesFromEpic(epics)}
    ${createLinesFromUserStories(atomicUserStories)}
    ${createLinesFromTaskBacklog(tasks)}
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
    const description  = epic.description ?? ''
    return printLine(id, name, description,"Epic","")
   
}

function createLineFromEpicProcess (epic: Epic): string{
    const id = epic.id
    const name = epic.name ?? ''
   
    
    return  printLine(id, name, epic.process?.type.ref?.name ??'-',"Epic","")
}

function createLinesFromUserStories(atomicUserStories: AtomicUserStory[]): string {
    return expandToString`
    ${atomicUserStories.map(atomicUserStory=> createLineFromUserStory(atomicUserStory))}
    `
}
function createLineFromUserStory(atomicUserStory: AtomicUserStory): string {
    const id = atomicUserStory.id
    const name = atomicUserStory.name ?? ''
    const description = atomicUserStory.description ?? ''
    const epicId = atomicUserStory.epic?.type.ref?.id ?? ''
    
    return printLine(id, name, description,"Story",epicId)
    
}

function createLinesFromTaskBacklog(tasks: TaksBacklog[]):string {
    return expandToString`
    ${tasks.map(task => createLineFromTaskBacklog(task)).join('\n')}
    `
}

function createLineFromTaskBacklog(task: TaksBacklog):string{
    const id = task.id
    const name = task.name?? ''
    const description = task.description ?? ''
    const userStoryID = task.userstory?.type.ref?.id ?? ''

    return printLine(id, name, description,"Sub-Task",userStoryID)
    
}

function printLine(id: string, name: string, description: string, issueType: string, parent: string){
    return expandToString`
    ${id},"${name}","${description}",${issueType},${parent}`
}
