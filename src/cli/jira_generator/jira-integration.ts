import { Activity, AtomicUserStory, Epic, isAtomicUserStory, isBacklog, isEpic, isTaksBacklog, Model, TaksBacklog,  } from '../../language/generated/ast.js'
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
  const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaksBacklog))
  
  createEPIC(epics)
  createUserStory(userstories)
  createTaskBacklog(tasks)
}

async function createEPIC(epics: Epic[]) {

  epics.forEach ((epic) => {

    const epicJira = jiraIntegration.createEPIC(epic.name,epic.description);

    epicJira.then((id) =>{
      
      if (epic.process){
        // Each Activity in a process is maped to a User Story
        epic.process.ref.activities.map(activity =>  
             createUserStoryFromActivity(activity,id))
      }

    })
    
  });
  
}

async function  createUserStoryFromActivity (activity: Activity, epicID: string){

  const userStoryID = jiraIntegration.createUserStory(activity.name,activity.description, epicID)

  userStoryID.then((id) => {
    
    activity.tasks.map(task => {
      jiraIntegration.createTask(task.name,task.description,epicID);

    })

  });

}

function createUserStory(atocmiUserStories: AtomicUserStory[]) {
  atocmiUserStories.map(atomicUserStory => jiraIntegration.createUserStory(atomicUserStory.name,atomicUserStory.description))
  
}

function createTaskBacklog(backlogTasks: TaksBacklog[]) {
  backlogTasks.map(task => jiraIntegration.createTask(task.name, task.description))
  
}