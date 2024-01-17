import { Activity, AtomicUserStory, Epic, isAtomicUserStory, isBacklog, isEpic, isTaskBacklog, Model, TaskBacklog, Task } from '../../language/generated/ast.js'
import {JiraIntegration } from './service/JiraIntegrator.js'

declare var jiraIntegration;

export function generateAPI(model: Model) : void {

  const host = model.project.host; //'https://conectafapes.atlassian.net/';
  const email = model.project.email; //"paulossjunior@gmail.com";
  const apiToken  = model.project.token; //'ATATT3xFfGF0ohJQ8TyeYcbuMh1TT4qo-OjLPim47r8EMFJTOWJeeKNg4XcNNCd82-sYkENawVpEnwPSYMsKTwR3hepTr9GPJm_YC30v0wikyr4HmFMeGO9MWYyMhVgq_Lix9wupHW6TtKZlseWua4fps6OPGO8Ti6qvMrrL4sHcyVvvTJqvYSg=F32D003E';
  const projectKey = model.project.Identification;

  jiraIntegration = new JiraIntegration(email,apiToken,host,projectKey);

  const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))
  const userstories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))
  const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaskBacklog))
  
  createEPIC(epics)
  createUserStory(userstories)
  createTaskBacklog(tasks)
}

async function createEPIC(epics: Epic[]) {

  epics.forEach ((epic) => {

    jiraIntegration.createEPIC(epic.name,epic.description)
    .then(result => {
      console.log(`EPIC: ${result.key}`);
      if (epic.process){
        epic.process.ref.activities.map(async activity => await createUserStoryFromActivity(activity,result.key))
      }

      
    }).catch(error => {
      // Handle the timeout or any other errors
      console.error(error);
    });

    
    
  });
  
}

async function  createUserStoryFromActivity (activity: Activity, epicID: string){

  jiraIntegration.createUserStory(activity.name,activity.description, epicID).then(result => {
    
    console.log(`US: ${result.key}`);

    activity.tasks.map(async task => await createSubTaskFromTaskBacklog(task,result.key))

  }).catch(error => {
    // Handle the timeout or any other errors
    console.error(error);
  });

}

async function createSubTaskFromTaskBacklog(task: Task, usID:string) {

  await jiraIntegration.createSubTask(task.name,task.description, usID).then(result => {
    
    console.log(`Task: ${result.key}`);

  }).catch(error => {
    // Handle the timeout or any other errors
    console.error(error);
  });

}

function createUserStory(atocmiUserStories: AtomicUserStory[]) {
  atocmiUserStories.map(atomicUserStory => jiraIntegration.createUserStory(atomicUserStory.name,atomicUserStory.description))
  
}

async function createTaskBacklog(backlogTasks: TaskBacklog[]) {
  backlogTasks.map( task =>  jiraIntegration.createTask(task.name, task.description))
  
}