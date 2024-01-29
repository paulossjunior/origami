
import { Model} from '../../language/generated/ast.js'


import { JiraApplication } from './application/JiraApplication.js';


export function APIApplication(model: Model,target_folder: string) : void {
  
  
  const host = model.project.host; 
  const email = model.project.email; 
  const apiToken  = model.project.token; 
  const projectKey = model.project.Identification;

  const jiraApplication = new JiraApplication(email,apiToken,host,projectKey,target_folder)
  
  jiraApplication.run(model)
  

}
 





