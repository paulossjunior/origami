import { Epic, AtomicUserStory, isAtomicUserStory, isBacklog, isEpic, Model } from '../../language-server/generated/ast.js'
import fs from "fs";
import { createPath} from '../generator-utils.js'
import path from 'path'
import { expandToString, expandToStringWithNL } from 'langium';

export function generateJIRACSV(model: Model, target_folder: string) : void {
    
    fs.mkdirSync(target_folder, {recursive:true})

    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))

    const userStories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))

    const JIRA_PATH = createPath(target_folder,'jira')
    
    fs.writeFileSync(path.join(JIRA_PATH, "/jira-backlog.md"), createCSV(epics,userStories))
}

function createCSV(epics: Epic[],atomicUserStories: AtomicUserStory[]): string {
    return expandToStringWithNL`
    "Issue key,Summary,Description,Status,Labels,Issue Type,Parent"
    ${createLinesFromEpic(epics)}
    ${createLinesFromUserStories(atomicUserStories)}
    `
}


function createLinesFromEpic(epics: Epic[]): string{
    return expandToStringWithNL`
    ${epics.map(epic => createLineFromEpic(epic)).join('\n')}
    `
}

function createLineFromEpic(epic: Epic): string{
    return expandToString`
    ${epic.id},${epic.name},This is a EPIC,To Do,Feature,Epic,,
    `
}

function createLinesFromUserStories(atomicUserStories: AtomicUserStory[]): string {
    return expandToStringWithNL`
    ${atomicUserStories.map(atomicUserStory=> createLineFromUserStory(atomicUserStory))}
    `
}
function createLineFromUserStory(atomicUserStory: AtomicUserStory): string {
    return expandToString`
    ${atomicUserStory.id},${atomicUserStory.name},This is a user story,To Do,Feature,Story,,
    `
}