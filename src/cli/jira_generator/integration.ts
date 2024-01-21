
import { Model, TimeBox, isBacklog, isEpic, isTimeBox, Epic, Activity, AtomicUserStory, Task, TaskBacklog, isAtomicUserStory,isTaskBacklog} from '../../language/generated/ast.js'
import {JiraIntegrationService } from './service/JiraIntegratorService.js'


declare var jiraIntegrationService;


export function generateAPI(model: Model) : void {

  const host = model.project.host; 
  const email = model.project.email; 
  const apiToken  = model.project.token; 
  const projectKey = model.project.Identification;

  jiraIntegrationService = new JiraIntegrationService(email,apiToken,host,projectKey);
 
  const timeBoxes = model.components.filter(isTimeBox)
  const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))
  const userstories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))
  const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaskBacklog))



  createEPIC(epics)
  createUserStory(userstories)
  createTaskBacklog(tasks)
  createTimeBoxes(timeBoxes)
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

async function createTimeBoxes(timeBoxes:TimeBox[]) {
  timeBoxes.map(async timeBox => await jiraIntegrationService.createSprint(timeBox.name, timeBox.description, timeBox.startDate, timeBox.endDate));
  
  
}


function createUserStory(atocmiUserStories: AtomicUserStory[]) {
  // Verificar quando tiver relação com uma EPIC
  atocmiUserStories.map(atomicUserStory => this.jiraIntegration.createUserStory(atomicUserStory.name,atomicUserStory.description))
  
}

async function createTaskBacklog(backlogTasks: TaskBacklog[]) {
  
  // Verificar quando tiver relação com uma US

  await Promise.all(backlogTasks.map(async task => await this.jiraIntegration.createTask(task.name, task.description)))
  
}


