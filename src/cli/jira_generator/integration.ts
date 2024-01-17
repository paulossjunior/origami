import { Activity, AtomicUserStory, Epic, isAtomicUserStory, isBacklog, isEpic, isTaskBacklog, Model, TaskBacklog, Task } from '../../language/generated/ast.js'
import {JiraIntegrationService } from './service/JiraIntegratorService.js'

declare var jiraIntegrationService;

export function generateAPI(model: Model) : void {

  const host = model.project.host; //'https://conectafapes.atlassian.net/';
  const email = model.project.email; //"paulossjunior@gmail.com";
  const apiToken  = model.project.token; //'ATATT3xFfGF0ohJQ8TyeYcbuMh1TT4qo-OjLPim47r8EMFJTOWJeeKNg4XcNNCd82-sYkENawVpEnwPSYMsKTwR3hepTr9GPJm_YC30v0wikyr4HmFMeGO9MWYyMhVgq_Lix9wupHW6TtKZlseWua4fps6OPGO8Ti6qvMrrL4sHcyVvvTJqvYSg=F32D003E';
  const projectKey = model.project.Identification;

  jiraIntegrationService = new JiraIntegrationService(email,apiToken,host,projectKey);

  const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))
  const userstories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))
  const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaskBacklog))
  
  createEPIC(epics)
  createUserStory(userstories)
  createTaskBacklog(tasks)
}

async function createEPIC(epics: Epic[]) {

  epics.forEach ((epic) => {
    let description = epic.description ?? ""
    
    if (epic.process){
      description = epic.process.ref.description ?? ""
    }
    
    jiraIntegrationService.createEPIC(epic.name,description)
    .then(result => {
      if (epic.process){
        epic.process.ref.activities.map(async activity => await createUserStoryFromActivity(activity,result.key))
      }      
    }).catch(error => {
      console.error(error);
    });

    
  });
  
}

async function  createUserStoryFromActivity (activity: Activity, epicID: string){

  jiraIntegrationService.createUserStory(activity.name,activity.description, epicID).then(result => {
  
    activity.tasks.map(async task => await createSubTaskFromTaskBacklog(task,result.key))

  }).catch(error => {
    console.error(error);
  });

}

async function createSubTaskFromTaskBacklog(task: Task, usID:string) {

  await jiraIntegrationService.createSubTask(task.name,task.description, usID).catch(error => {
    console.error(error);
  });

}

function createUserStory(atocmiUserStories: AtomicUserStory[]) {

  atocmiUserStories.map(async atomicUserStory => {
    let description = atomicUserStory.description ?? ""
    
    if (atomicUserStory.activity){
      description = atomicUserStory.activity.ref.description ?? ""
    }
    await jiraIntegrationService.createUserStory(atomicUserStory.name,description).then (result =>{

    }).catch (error => {
      console.error(error);
    })
  }
)
  
}

async function createTaskBacklog(backlogTasks: TaskBacklog[]) {
  backlogTasks.map( task =>  jiraIntegrationService.createTask(task.name, task.description))
  
}