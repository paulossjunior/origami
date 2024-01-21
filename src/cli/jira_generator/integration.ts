
import { Model, TimeBox, isTimeBox } from '../../language/generated/ast.js'
import {JiraIntegrationService } from './service/JiraIntegratorService.js'


declare var jiraIntegrationService;


export function generateAPI(model: Model) : void {

  const host = model.project.host; //'https://conectafapes.atlassian.net/';
  const email = model.project.email; //"paulossjunior@gmail.com";
  const apiToken  = model.project.token; //'ATATT3xFfGF0ohJQ8TyeYcbuMh1TT4qo-OjLPim47r8EMFJTOWJeeKNg4XcNNCd82-sYkENawVpEnwPSYMsKTwR3hepTr9GPJm_YC30v0wikyr4HmFMeGO9MWYyMhVgq_Lix9wupHW6TtKZlseWua4fps6OPGO8Ti6qvMrrL4sHcyVvvTJqvYSg=F32D003E';
  const projectKey = model.project.Identification;

  jiraIntegrationService = new JiraIntegrationService(email,apiToken,host,projectKey);
 
  const timeBoxes = model.components.filter(isTimeBox)

  createTimeBoxes(timeBoxes)
}

async function createTimeBoxes(timeBoxes:TimeBox[]) {
  timeBoxes.map(async timeBox => await jiraIntegrationService.createSprint(timeBox.name, timeBox.description, timeBox.startDate, timeBox.endDate));
  
}


