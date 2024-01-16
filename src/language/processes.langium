import 'helpers'

Process:
    'process' id=ID'{'
        (Name | Description | activities+= Activity |DefinitionDone|DefinitionReady|Learning)*
    '}'
 ;    

Activity:
    'activity' id=ID '{'
        (Name | Description | tasks+=Task |DefinitionDone|DefinitionReady|Learning)*
    '}'
;

Task:
    'task' id=ID '{'
        (Name | Description |DefinitionDone|DefinitionReady|Learning)*
        
    '}'
;

