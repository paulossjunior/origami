import 'terminals'
import 'helpers'

Process:
    'process' name=ID'{'
        FullName=FullName
        |(activities+=Activity)*
    '}'
 ;    

FullName: 
    'fullName' ':' fullName = STRING
;

Activity:
    'activity' name=ID '{'
        FullName=FullName
        |(taskes+=Task)*
    '}'
;

Task:
    'task' name=ID '{'
        FullName=FullName
        |Description
    '}'
;
