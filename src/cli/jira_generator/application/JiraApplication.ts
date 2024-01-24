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
  sprintDAO: JsonFileCRUD

  constructor(email: string, apiToken: string, host: string, projectKey: string, target_folder:string){
    this.target_folder = target_folder
   
    this.DB_PATH = createPath(this.target_folder,'db')
    
    const ISSUEPATH = path.join(this.DB_PATH, 'issues.json');
    this.issueDAO = new JsonFileCRUD(ISSUEPATH)

    const SPRINTPATH = path.join(this.DB_PATH, 'sprints.json');
    this.sprintDAO = new JsonFileCRUD(SPRINTPATH)


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
  
  private async _createEPIC(epic:Epic){
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
  }

  public async createEPIC(epics: Epic[]) {

    epics.forEach ((epic) => {
      const id = `${epic.id}`
      if (!this.idExists(id, this.issueDAO)){
        this._createEPIC(epic)
      }     
    });
    
  }
  
  public async createUserStoryFromActivity (activity: Activity, epicID: string){
    const id = `${epicID}-${activity.id}`
    
    if (!this.idExists(id, this.issueDAO)){
      await this.jiraIntegrationService.createUserStory(activity.name,activity.description, epicID).then(result => {
      
        this.saveOnFile(id,result, this.issueDAO, "AtomicUserStory")      
        const key = (result as any).key 
        activity.tasks.map(async task => await this.createSubTaskFromTaskBacklog(task,key))
        
      }).catch(error => {
          console.error(error);
      });      
    }  
    
  }
  
  public async createSubTaskFromTaskBacklog(task: Task, usID:string) {
    const id = `${usID}-${task.id}`
    
    if (!this.idExists(id, this.issueDAO)){

      await this.jiraIntegrationService.createSubTask(task.name,task.description, usID).then(result => {
        this.saveOnFile(id, result, this.issueDAO, "Task")
      
      }).catch(error => {
          console.error(error);
      });
    }   
  
  }
  
  public async createTimeBoxes(timeBoxes:TimeBox[]) {
    timeBoxes.map(async timeBox => {
      if (!this.idExists(timeBox.id, this.sprintDAO)){
        this.jiraIntegrationService.createSprint(timeBox.name, timeBox.description, timeBox.startDate, timeBox.endDate).then( result => {
          this.saveOnFile(timeBox.id, result, this.sprintDAO, "Sprint")
        })
      }
      
    }
      
    );
  
  }
   
  public async createUserStory(atocmiUserStories: AtomicUserStory[]) {
    // Verificar quando tiver relação com uma EPIC
    atocmiUserStories.map(atomicUserStory => {
      if (!this.idExists(atomicUserStory.id, this.issueDAO)){
        this.jiraIntegrationService.createUserStory(atomicUserStory.name,atomicUserStory.description).then(result => {
          this.saveOnFile(atomicUserStory.id, result, this.issueDAO, "AtomicUserStory")
        })
      }      
    })
    
  }
  
  public async createTaskBacklog(backlogTasks: TaskBacklog[]) {
    
    // Verificar quando tiver relação com uma US
  
    backlogTasks.map(task =>  {
      if (!this.idExists(task.id, this.issueDAO)){
        this.jiraIntegrationService.createTask(task.name, task.description).then(result => {
          this.saveOnFile(task.id, result, this.issueDAO, "Task")  
        })
      }
      
    })
    
  }  

  private saveOnFile(key:any, value:any, _function:any, type:string){
    value.type = type
    _function.create(key, value)
  }

  private idExists (key:any, _function){
    return _function.idExists(key)
  }
}   