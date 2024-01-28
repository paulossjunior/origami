import { Epic, AtomicUserStory, isAtomicUserStory, TimeBox, Activity, Task, isBacklog, isEpic, Model, isTaskBacklog, TaskBacklog, isTimeBox } from "../../../language/generated/ast.js"
import { JiraIntegrationService } from "../service/JiraIntegratorService.js";
import {Util} from '../service/util.js';
import { createPath} from '../../generator-utils.js'
import { IssueDAO } from "../dao/IssueDAO.js";
import { SprintDAO } from "../dao/SprintDAO.js";

export class JiraApplication {

  //TODO: acertar os indices. Formato:EPIC.US.TASK ou EPIC.PROCESS.TASK ou US.TASK
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
  
  public async createEPIC(epics: Epic[]) {

    epics.forEach ((epic) => {
      
      const id = `${epic.id.toLowerCase()}`

      if (!this.idExists(id, this.issueDAO)){
        this._createEPIC(epic)
      }     
    });
    
  }

  private async _createEPIC(epic:Epic){

    let description = epic.description ?? ""
      
    if (epic.process){
      description = epic.process.ref.description ?? ""
    }
    
    this.jiraIntegrationService.createEPIC(epic.name,description)
     .then(result => {
        
        const key = (result as any).key 
        const epicID = epic.id.toLowerCase()

        this.saveOnFile(epicID, result, this.issueDAO, "epic")  

        if (epic.process){
          epic.process.ref.activities.map(async activity => await this.createUserStoryFromActivity(activity,key, epicID))
        }      
        
        }).catch(error => {
          console.error(error);
    });           
  }

  
  private async createUserStoryFromActivity (activity: Activity, epicID: string, epicInternalID:string){
    
    var activityID = activity.id.toLowerCase()

    if (epicID){
      activityID = `${epicInternalID}.${activityID}`
    }
    
    
    if (!this.idExists(activityID, this.issueDAO)){

      await this.jiraIntegrationService.createUserStory(activity.name,activity.description, epicID).then(result => {
      
        this.saveOnFile(activityID,result, this.issueDAO, "atomicuserstory") 
       
        const key = (result as any).key 

        activity.tasks.map(async task => await this.createSubTaskFromTaskBacklog(task,key,epicInternalID,activity.id.toLowerCase()))
        
      }).catch(error => {
          console.error(error);
      });      
    }  
    
  }
  
  private async createSubTaskFromTaskBacklog(task: Task, usID:string, epicInternalID:string,activityInternalID:string) {
    
    let id = `${activityInternalID}.${task.id.toLowerCase()}`
   
    if (epicInternalID){
      id = `${epicInternalID}.${activityInternalID}.${task.id.toLowerCase()}`
    }
        
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

      if (!this.idExists(timeBox.id.toLowerCase(), this.sprintDAO)){

        this.jiraIntegrationService.createSprint(timeBox.name, timeBox.description, timeBox.startDate, timeBox.endDate).then( async result => {

          await this.saveOnFile(timeBox.id.toLowerCase(), result, this.sprintDAO, "sprint")

          timeBox.plannig.planningItems.map(async planningItem=>{
            
            const itemID = planningItem.item.ref.id ?? planningItem.itemString
            const issue = this.issueDAO.readByKey(itemID)
            const data = [issue]
            const sprintID = (result as any).id          
            console.log (`${data}-${sprintID}`)

          })

        })

      }
      
    }
      
    );
  
  }
   
  public async createUserStory(atocmiUserStories: AtomicUserStory[]) {
    // Verificar quando tiver relação com uma EPIC

    atocmiUserStories.map(atomicUserStory => {

      var atomicUserStoryID = atomicUserStory.id.toLowerCase()

      if (atomicUserStory.epic){
        atomicUserStoryID = `${atomicUserStory.epic.ref.id.toLowerCase()}.${atomicUserStory.id.toLowerCase()}`
      }

      if (!this.idExists(atomicUserStoryID, this.issueDAO)){
       
        var description = atomicUserStory.description
       
        if (atomicUserStory.activity){
            description = atomicUserStory.activity.ref.description ?? atomicUserStory.description
        }

        this.jiraIntegrationService.createUserStory(atomicUserStory.name,description).then(result => {

          this.saveOnFile(atomicUserStory.id.toLowerCase(), result, this.issueDAO, "atomicuserstory")
         
          //Verificando se USer Story foi criado baseada em uma activity
          if (atomicUserStory.activity){
            
            const key = (result as any).key           
            
            atomicUserStory.activity.ref.tasks.map(task =>  this.createSubTaskFromTaskBacklog(task,key,undefined,atomicUserStoryID))
           
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

  
  private async saveOnFile(key:any, value:any, _function:any, type:string){

    value.type = type

    _function.create(key, value)
  }

  private idExists (key:any, _function){

    return _function.idExists(key)

  }
}   