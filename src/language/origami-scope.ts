import { AstNode, AstNodeDescription, DefaultScopeComputation, LangiumDocument } from "langium";
import { CancellationToken } from "vscode-languageclient";
import { Model, isBacklog, isEpic,isProcess} from "./generated/ast.js";

/**
 * Gerador customizado para o escopo global do arquivo.
 * Por padrão, o escopo global só contém os filhos do nó raiz,
 * sejam acessíveis globalmente
 */
export class CustomScopeComputation extends DefaultScopeComputation {
    override async computeExports(document: LangiumDocument<AstNode>, cancelToken?: CancellationToken | undefined): Promise<AstNodeDescription[]> {
        // Os nós que normalmente estariam no escopo global
        
        const default_global = await super.computeExports(document, cancelToken)

        const root = document.parseResult.value as Model
        
        //colocando os epic em escopo global
        const epics = root.components.filter(isBacklog).flatMap(backlog => 
            backlog.userstories.filter(isEpic).map(epic => this.descriptions.createDescription(epic, `${epic.id}`, document)))
        
        /*const userstories = root.components.filter(isBacklog).flatMap(backlog => 
            backlog.userstories.filter(isAtomicUserStory).map(atomicUserStory => this.descriptions.createDescription(atomicUserStory, `${atomicUserStory.id}`, document)))   */
       
        // Define Process as Global
        const processes = root.components.filter(isProcess).flatMap(
            process => this.descriptions.createDescription(process, `${process.id}`, document))

            root.components.filter(isProcess).map(
                process => this.exportNode(process, default_global, document))
           
    
         
        // Define Activity 
        //const activities = root.components.filter(isProcess).flatMap(process => process.activities.map(activity => this.descriptions.createDescription(activity, `${activity.id}`, document)))
        
        //userstories activities
        
        return default_global.concat(epics,processes)
    }
}
