import { Epic, AtomicUserStory, isAtomicUserStory, TimeBox, Activity, Task, isBacklog, isEpic, Model, isTaskBacklog, TaskBacklog, isTimeBox } from "../../../language/generated/ast.js"
import { JiraIntegrationService } from "../service/JiraIntegratorService.js";
import {Util} from '../service/util.js';
import { createPath} from '../../generator-utils.js'
import { JsonFileCRUD } from "../dao/JsonFileCRUD.js";
import path from "path";

export class JiraApplication {


  jiraIntegrationService: JiraIntegrationService
  issuesMap:  Map<string,string>
  sprintsMap: Map<string,string>
  target_folder : string
  DB_PATH: string
  issueDAO: JsonFileCRUD

  constructor(email: string, apiToken: string, host: string, projectKey: string, target_folder:string){
    this.target_folder = target_folder
   
    this.DB_PATH = createPath(this.target_folder,'db')
    const ISSEPATH = path.join(this.DB_PATH, 'issues.json');
    this.issueDAO = new JsonFileCRUD(ISSEPATH)

    Util.mkdirSync(target_folder)
    this.jiraIntegrationService = new JiraIntegrationService(email,apiToken,host,projectKey);         
    

    
  }
    
  public async run(model:Model){

    const timeBoxes = model.components.filter(isTimeBox)
    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))
    const userstories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))
    const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaskBacklog))
      
    //Criando os EPIC que não foram criados anteriormente
    await this.createEPIC(epics)
    await this.createUserStory(userstories)
    await this.createTaskBacklog(tasks)
    await this.createTimeBoxes(timeBoxes)

  }
        
  public async createEPIC(epics: Epic[]) {

    epics.forEach ((epic) => {
    let description = epic.description ?? ""
      
    if (epic.process){
      description = epic.process.ref.description ?? ""
    }
      
     this.jiraIntegrationService.createEPIC(epic.name,description)
    .then(result => {
      const key = (result as any).key 
      this.saveOnFile(epic.id, result, this.issueDAO, "Epic")  

      if (epic.process){
        epic.process.ref.activities.map(async activity => await this.createUserStoryFromActivity(activity,key))
      }      
      
      }).catch(error => {
        console.error(error);
      });
  
      
    });
    
  }
  
  public async createUserStoryFromActivity (activity: Activity, epicID: string){
  
    await this.jiraIntegrationService.createUserStory(activity.name,activity.description, epicID).then(result => {
      
      this.saveOnFile(activity.id,result, this.issueDAO, "AtomicUserStory")      
      const key = (result as any).key 
      activity.tasks.map(async task => await this.createSubTaskFromTaskBacklog(task,key))
      
      })
      .catch(error => {
        console.error(error);
      });
  
  }
  
  public async createSubTaskFromTaskBacklog(task: Task, usID:string) {
  
    await this.jiraIntegrationService.createSubTask(task.name,task.description, usID).then(result => {
      this.saveOnFile(task.id, result, this.issueDAO, "Task")
    
      }).catch(error => {
        console.error(error);
      });
  
  }
  
  public async createTimeBoxes(timeBoxes:TimeBox[]) {
    timeBoxes.map(async timeBox => await this.jiraIntegrationService.createSprint(timeBox.name, timeBox.description, timeBox.startDate, timeBox.endDate));
  
  }
  
  
  public async createUserStory(atocmiUserStories: AtomicUserStory[]) {
    // Verificar quando tiver relação com uma EPIC
    atocmiUserStories.map(atomicUserStory => {
      this.jiraIntegrationService.createUserStory(atomicUserStory.name,atomicUserStory.description).then(result => {
               
        this.saveOnFile(atomicUserStory.id, result, this.issueDAO, "AtomicUserStory")
      })
    })
    
  }
  
  public async createTaskBacklog(backlogTasks: TaskBacklog[]) {
    
    // Verificar quando tiver relação com uma US
  
    backlogTasks.map(task =>  {
      this.jiraIntegrationService.createTask(task.name, task.description).then(result => {
        this.saveOnFile(task.id, result, this.issueDAO, "Task")  
      })
    })
    
  }  

  private saveOnFile(key:any, value:any, _function:any, type:string){
    value.type = type
    _function.create(key, value)
  }
}   