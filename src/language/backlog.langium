
import 'processes'

Backlog:
    'backlog' id=ID '{'
        (userstories += (Epic|AtomicUserStory|TaskBacklog))*
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
        |'epic' ':' epic=[Epic:QualifiedName] 
        |'activity' ':' activity=[Activity:QualifiedName]
        )*'}'
;

TaskBacklog:
    'task' id=ID '{'
        (Name 
        |Description
        |DefinitionDone
        |DefinitionReady
        |Learning 
        |'userstory'':'  userstory=[AtomicUserStory:QualifiedName]
        |'task' ':' task=[Task:QualifiedName])*
        '}'
;
    




