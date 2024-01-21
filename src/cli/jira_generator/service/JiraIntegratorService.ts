
import {Util} from './util.js';

export class JiraIntegrationService {

  projectKey: string;
  timeout: number;
  email:string;
  apiToken:string;
  host:string

  constructor(email: string, apiToken: string, host: string, projectkey: string){
      
      this.projectKey = projectkey;
      this.timeout = 5000
      this.email = email;
      this.apiToken = apiToken;
      this.host = host;
           

    }
   
  public async createEPIC (summary: string, description: string, parent?:string){
      
      return await this.createIssue(summary,'Epic',description, parent)
    }

  public async createUserStory (summary: string,description: string,parent?:string){
      
      return await this.createIssue(summary,'Story',description,parent)
    }

  public async createTask (summary: string, description: string,parent?:string){
      
      return await this.createIssue(summary,'Task',description,parent)
    }

  public async createSubTask (summary: string,description: string,parent?:string){
     
      return await this.createIssue(summary,'Subtarefa',description,parent)
    }


  private async createIssue (summary: string, type: string, description: string,parent?:string){
      
      const URL = this.host+"/rest/api/3/issue"

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, this.timeout);
      });

      const parentPart = parent ? `,"parent":{"key": "${parent}"}` : ` `;

      const data = `{
        "fields": {
          "summary": "${summary}",
          "issuetype": {
            "name": "${type}"
          },
          "project": {
            "key": "${this.projectKey}"
          }${parentPart}          
        }
      }`
      console.log (data)
      return Promise.race([
        Util.send(URL,this.email, this.apiToken, data),
        timeoutPromise,
      ]);

  }


  public async createSprint (name:string, goal: string, startDate: string, endDate: string){
    try {
      
      const URL = this.host+'/rest/agile/1.0/sprint'
      
      startDate = Util.convertDateFormat(startDate)
      endDate = Util.convertDateFormat (endDate)
      
      console.log (startDate)

      const data = `{
        "startDate": "${startDate}",
        "name": "${name}",
        "endDate": "${endDate}",
        "goal": "${goal}",
        "originBoardId": 3
      }`;

  
      return await Util.send(URL,this.email, this.apiToken, data)
      

    }catch (error) {
     
      throw new Error(`Error fetching data: ${error.message}`);
    }
   
    
   
    
   
  

  }


}