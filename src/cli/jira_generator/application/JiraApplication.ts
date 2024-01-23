import { Epic, AtomicUserStory, isAtomicUserStory, TimeBox, Activity, Task, isBacklog, isEpic, Model, isTaskBacklog, TaskBacklog, isTimeBox } from "../../../language/generated/ast.js"
import { JiraIntegrationService } from "../service/JiraIntegratorService.js";
import {Util} from '../service/util.js';
import { createPath} from '../../generator-utils.js'

export class JiraApplication {


  jiraIntegrationService: JiraIntegrationService
  issuesMap:  Map<string,string>
  sprintsMap: Map<string,string>
  target_folder : string
  DB_PATH: string

  constructor(email: string, apiToken: string, host: string, projectKey: string, target_folder:string){
    this.target_folder = target_folder
    
    this.DB_PATH = createPath(this.target_folder,'db')

    this.issuesMap = new Map<string,string>
    this.sprintsMap = new Map<string,string>
      
    Util.mkdirSync(target_folder)
    this.jiraIntegrationService = new JiraIntegrationService(email,apiToken,host,projectKey);         
      
  }
    
  public async run(model:Model){

    const timeBoxes = model.components.filter(isTimeBox)
    const epics = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isEpic))
    const userstories = model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isAtomicUserStory))
    const tasks =  model.components.filter(isBacklog).flatMap(backlog => backlog.userstories.filter(isTaskBacklog))
      
    //Carregando os elementos que estão nos arquivos
    await this.readDBFiles()

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
      this.addIssue(epic.id, JSON.stringify(result))

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
      this.addIssue(activity.id, JSON.stringify(result))   
      const key = (result as any).key 
      activity.tasks.map(async task => await this.createSubTaskFromTaskBacklog(task,key))
     
      })
      .catch(error => {
        console.error(error);
      });
  
  }
  
  public async createSubTaskFromTaskBacklog(task: Task, usID:string) {
  
    await this.jiraIntegrationService.createSubTask(task.name,task.description, usID).then(result => {
  
      this.addIssue(task.id, JSON.stringify(result))
    
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
        this.addIssue(atomicUserStory.id, JSON.stringify(result))
      })
    })
    
  }
  
  public async createTaskBacklog(backlogTasks: TaskBacklog[]) {
    
    // Verificar quando tiver relação com uma US
  
    backlogTasks.map(task =>  {
      this.jiraIntegrationService.createTask(task.name, task.description).then(result => {
        this.addIssue(task.id, JSON.stringify(result))
      })
    })
    
  }
  
  private async readDBFiles(){
    const issueFilePath = this.DB_PATH+"/issue.json"
    const exists = Util.existFile(issueFilePath);
    
    if (exists){
      Util.readFiletoMap(issueFilePath, this.issuesMap)
      const mapSize = this.issuesMap.size;
      console.log('Size of the Map:', mapSize);
    }
  
    
  }

  private async addIssue(id:string, result:string){
    
    this.issuesMap.set(id, result)    
    Util.createFile(this.DB_PATH,"issue.json",this.issuesMap)
  }

}   