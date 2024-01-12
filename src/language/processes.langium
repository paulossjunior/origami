import 'helpers'

Process:
    'process' id=ID'{'
        |Name
        |Description
        |(activities+=Activity)*
    '}'
 ;    

Activity:
    'activity' id=ID '{'
        |Name
        |Description
        |(taskes+=Task)*
    '}'
;

Task:
    'task' id=ID '{'
        |Name
        |Description
        
    '}'
;
