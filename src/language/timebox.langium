
import 'backlog'

type timeBoxTask = Epic| AtomicUserStory| TaskBacklog; 

TimeBox:
    'timebox' id=ID '{'
        (Name |Description |plannig=Planning|'startDate'':' startDate=DATE |'endDate' ':' endDate=DATE)*
    '}' 
    ;

Planning: 
    'planning' '{' 
        (item+=PlanningItem)*
    '}' 
;

PlanningItem:
    ('item' ':' item=[timeBoxTask:QualifiedName])? ('item' ':' itemString=STRING)? ('assigner' ':' assigner=STRING)?
;  