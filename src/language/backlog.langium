
import 'processes'

Backlog:
    'backlog' id=ID '{'
        (userstories += (Epic|AtomicUserStory|TaksBacklog))*
    '}' 
    ;

Epic :
    'epic' id=ID '{'
        (Name  
        |Description
        |DefinitionDone
        |DefinitionReady
        |Learning
        |'process' ':' process=[Process:QualifiedName])*  
        '}'
;

AtomicUserStory :
    'userstory' id=ID '{' 
        (Name 
        |Description
        |DefinitionDone
        |DefinitionReady
        |Learning
        |'epic' epic=[Epic:QualifiedName] 
        |'activity' activity=[Activity:QualifiedName]
        )*'}'
;

TaksBacklog:
    'task' id=ID '{'
        (Name 
        |Description
        |DefinitionDone
        |DefinitionReady
        |Learning 
        |'userstory' userstory=[AtomicUserStory:QualifiedName]
        |'task' task=[Task:QualifiedName])*
        '}'
;
    




