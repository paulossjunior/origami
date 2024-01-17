
import { Version3Client } from 'jira.js';
import { Issue } from 'jira.js/out/agile/issue.js';

export class JiraIntegrationService {

    client: Version3Client;
    projectKey: string;
    timeout: number;

    constructor(email: string, apiToken: string, host: string, projectkey: string){
      
      this.projectKey = projectkey;
      this.timeout = 5000

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

    public async createEPIC (summary: string, description: string, parent?:string){
      
      return await this.createIssue(summary,'Epic',description, parent)
    }

    public async createUserStory (summary: string,description: string,parent?:string){
      
      return await this.createIssue(summary,'Story',description,parent)
    }

    public async createTask (summary: string, description: string,parent?:string){
      
      return await this.createIssue(summary,'Task',description,parent)
    }

    public async createLink (parent: string, child: string){

      this.client.issueLinks.linkIssues({
        inwardIssue: { key: parent },
        outwardIssue: { key : child },
        type: { name: 'blocks' },
      })
    }


    public async createSubTask (summary: string,description: string,parent?:string){
     
      return await this.createIssue(summary,'Subtarefa',description,parent)
    }

  public async createIssue (summary: string, type: string, description: string,parent?:string){
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, this.timeout);
      });

      const issue = {
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
            key: parent
          },
        }
      }
      console.log(`${issue}`)

      return Promise.race([
        this.client.issues.createIssue(issue),
        timeoutPromise,
      ]);

  }

    public  async getIssue (id: string): Promise<Issue> {
      return await this.client.issues.getIssue({ issueIdOrKey: id });
    }
}

