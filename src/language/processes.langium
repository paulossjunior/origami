import 'helpers'

Process:
    'process' name=ID'{'
        Name
        |Description
        |(activities+=Activity)*
    '}'
 ;    

Activity:
    'activity' id=ID '{'
        Name
        |Description
        |(taskes+=Task)*
    '}'
;

Task:
    'task' id=ID '{'
        Name
        |Description
        
    '}'
;
