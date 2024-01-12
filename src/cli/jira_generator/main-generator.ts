import { Epic, AtomicUserStory, isAtomicUserStory, isBacklog, isEpic, Model } from '../../language/generated/ast.js'
import fs from "fs";
import { createPath} from '../generator-utils.js'
import path from 'path'
import { expandToString, expandToStringWithNL } from 'langium';

export function generateJiraCSV(model: Model, target_folder: string) : void {
    
    fs.mkdirSync(target_folder, {recursive:true})

    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))

    const userStories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))

    const JIRA_PATH = createPath(target_folder,'jira')
    
    fs.writeFileSync(path.join(JIRA_PATH, "/jira-backlog.csv"), createCSV(epics,userStories))
}

function createCSV(epics: Epic[],atomicUserStories: AtomicUserStory[]): string {
    return expandToStringWithNL`
    "Issue key,Summary,Description,Status,Labels,Issue Type,Parent"
    ${createLinesFromEpic(epics)}
    ${createLinesFromUserStories(atomicUserStories)}
    ${createTaskLinesFromUserStory(atomicUserStories)}
    `
}


function createLinesFromEpic(epics: Epic[]): string{
    return expandToString`
    ${epics.map(epic => createLineFromEpic(epic)).join('\n')}
    `
}

function createLineFromEpic(epic: Epic): string{
    return expandToString`
    ${epic.id},${epic.name},${epic.name},To Do,Feature,Epic,
    `
}

function createLinesFromUserStories(atomicUserStories: AtomicUserStory[]): string {
    return expandToString`
    ${atomicUserStories.map(atomicUserStory=> createLineFromUserStory(atomicUserStory))}
    `
}
function createLineFromUserStory(atomicUserStory: AtomicUserStory): string {
    return expandToString`
    ${atomicUserStory.id},${atomicUserStory.name},${atomicUserStory.name},To Do,Feature,Story,EPIC-${atomicUserStory.epic?.type.ref?.id ??'' }
    `
}

function createTaskLinesFromUserStory(atomicUserStories: AtomicUserStory[]): string {
    return expandToString`
    ${atomicUserStories.map(atomicUserStory=> createLineFromUserStory(atomicUserStory))}
    `
}