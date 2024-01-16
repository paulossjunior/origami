
import { Version3Client } from 'jira.js';
import { Issue } from 'jira.js/out/agile/issue.js';

export class JiraIntegration {

    client: Version3Client;
    projectKey: string;

    constructor(email: string, apiToken: string, host: string, projectkey: string){
      this.projectKey = projectkey;

      this.client = new Version3Client({
            host,
            authentication: {
              basic: {
                email,
                apiToken,
              },
            },
          });

    }

    public async createEPIC (summary: string, description: string, parent?:string): Promise<string>{
      return this.createIssue(summary,'Epic',description, parent)
    }

    public async createUserStory (summary: string,description: string,parent?:string): Promise<string>{
      return this.createIssue(summary,'Story',description,parent)
    }

    public async createTask (summary: string,description: string,parent?:string): Promise<string>{
      return this.createIssue(summary,'Task',description,parent)
    }


    public async createSubTask (summary: string,description: string,parent?:string): Promise<string>{
      return this.createIssue(summary,'Sub-task',description,parent)
    }

    public async createIssue(summary: string, type: string,description: string,parent?:string): Promise<string>{

        const { id } = await this.client.issues.createIssue({
          fields: {
            summary: summary,
            description: description,
            issuetype: {
              name: type
            },
            project: {
              key: this.projectKey,
            },
            parent:{
              id: parent
            },
          }
        });
    
        return id
      
    }



    public  async getIssue (id: string): Promise<Issue> {
      return await this.client.issues.getIssue({ issueIdOrKey: id });
    }
}

