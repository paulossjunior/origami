import { Activity, Model, Process, Task, isProcess} from '../../language/generated/ast.js'
import fs from "fs";
import { createPath} from '../generator-utils.js'
import path from 'path'
import { expandToStringWithNL } from 'langium';

export function MarkdownApplication(model: Model,target_folder: string) : void {
  
    fs.mkdirSync(target_folder, {recursive:true})
    
    const DOC_PATH = createPath(target_folder,'doc')
    const PROCESS_PATH = createPath(DOC_PATH,'process')
    const processes = model.components.filter(isProcess)
    
    fs.writeFileSync(path.join(DOC_PATH, "/README.md"), createMainDocument())
    fs.writeFileSync(path.join(PROCESS_PATH, "/README.md"), createProcessesDocument(processes))
  
}
function createMainDocument():string{
    return expandToStringWithNL`
    # Documentation Overview

    1. [Process](./process/README.md): Describes the processes used to build the solution.
    2. [Management](./management/README.md): Presents the Team, Project Management, Backlog and TimeBox used to build the solution.    

    `
}
function createProcessesDocument(processes: Process[]):string{
    return expandToStringWithNL`
    # Processes
    ${processes.map(process => createProcessDocument(process)).join('\n')}`
}

function createProcessDocument(process: Process): string{
    return expandToStringWithNL`
    ## ${process.name.toUpperCase()}
    ${process.description ?? `-`} 
    ${process.activities.map(activity => createActivityDocument(activity)).join('\n')}`
}

function createActivityDocument(activity: Activity):string{
    return expandToStringWithNL`
    ### ${activity.name.toUpperCase()}
    ${activity.description ?? `-`}
    ${activity.tasks.map(task => createTaskDocument(task)).join("\n")}
    `
}

function createTaskDocument(task:Task){
    return expandToStringWithNL`
    #### ${task.name.toUpperCase()}
    ${task.description ?? `-`}
    `
}
 
