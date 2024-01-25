import { Epic, AtomicUserStory, isAtomicUserStory, TimeBox, Activity, Task, isBacklog, isEpic, Model, isTaskBacklog, TaskBacklog, isTimeBox } from "../../../language/generated/ast.js"
import { JiraIntegrationService } from "../service/JiraIntegratorService.js";
import {Util} from '../service/util.js';
import { createPath} from '../../generator-utils.js'
import { IssueDAO } from "../dao/IssueDAO.js";
import { SprintDAO } from "../dao/SprintDAO.js";

export class JiraApplication {


  jiraIntegrationService: JiraIntegrationService
  issuesMap:  Map<string,string>
  sprintsMap: Map<string,string>
  issueDAO: IssueDAO
  sprintDAO: SprintDAO

  constructor(email: string, apiToken: string, host: string, projectKey: string, target_folder:string){

    Util.mkdirSync(target_folder)

    const DB_PATH = createPath(target_folder,'db')

    this.issueDAO = new IssueDAO(DB_PATH) 

    this.sprintDAO = new SprintDAO(DB_PATH)
   
    this.jiraIntegrationService = new JiraIntegrationService(email,apiToken,host,projectKey);         
    
  }
    
  public async run(model:Model){

    const timeBoxes = model.components.filter(isTimeBox)

    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))

    const userstories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))

    const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaskBacklog))
      
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
        this.saveOnFile(epic.id, result, this.issueDAO, "epic")  

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
    var id = `${activity.id}`
    
    if (epicID){
      id = `${epicID}.${activity.id}`
    }
    
    
    if (!this.idExists(id, this.issueDAO)){
      await this.jiraIntegrationService.createUserStory(activity.name,activity.description, epicID).then(result => {
      
        this.saveOnFile(id,result, this.issueDAO, "atomicuserstory")      
        const key = (result as any).key 
        activity.tasks.map(async task => await this.createSubTaskFromTaskBacklog(task,key))
        
      }).catch(error => {
          console.error(error);
      });      
    }  
    
  }
  
  public async createSubTaskFromTaskBacklog(task: Task, usID:string) {

    const id = `${usID}.${task.id}`
    
    if (!this.idExists(id, this.issueDAO)){

      await this.jiraIntegrationService.createSubTask(task.name,task.description, usID).then(result => {
        this.saveOnFile(id, result, this.issueDAO, "task")
      
      }).catch(error => {
          console.error(error);
      });
    }   
  
  }
  
  public async createTimeBoxes(timeBoxes:TimeBox[]) {

    timeBoxes.map(async timeBox => {

      if (!this.idExists(timeBox.id, this.sprintDAO)){

        this.jiraIntegrationService.createSprint(timeBox.name, timeBox.description, timeBox.startDate, timeBox.endDate).then( result => {

          this.saveOnFile(timeBox.id, result, this.sprintDAO, "sprint")

        })

      }
      
    }
      
    );
  
  }
   
  public async createUserStory(atocmiUserStories: AtomicUserStory[]) {
    // Verificar quando tiver relação com uma EPIC

    atocmiUserStories.map(atomicUserStory => {

      if (!this.idExists(atomicUserStory.id, this.issueDAO)){
        var description = atomicUserStory.description
        if (atomicUserStory.activity){
            description = atomicUserStory.activity.ref.description ?? atomicUserStory.description
        }

        this.jiraIntegrationService.createUserStory(atomicUserStory.name,description).then(result => {

          this.saveOnFile(atomicUserStory.id, result, this.issueDAO, "atomicuserstory")

          if (atomicUserStory.activity){
            const key = (result as any).key 
            atomicUserStory.activity.ref.tasks.map(task =>  this.createSubTaskFromTaskBacklog(task,key))
           
          }

        })

      }      

    })
    
  }
  
  public async createTaskBacklog(backlogTasks: TaskBacklog[]) {
    
    backlogTasks.map(task =>  {

      if (!this.idExists(task.id, this.issueDAO)){

        this.jiraIntegrationService.createTask(task.name, task.description).then(result => {

          this.saveOnFile(task.id, result, this.issueDAO, "task")  

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