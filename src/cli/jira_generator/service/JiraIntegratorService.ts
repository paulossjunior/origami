
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
      
      console.log (data)
      const response = await Util.send(URL,this.email, this.apiToken, data)
      console.log(response)

    }catch (error) {
      console.error('Error:', error.message);
    }
   
    
   
    
   
  

  }


}