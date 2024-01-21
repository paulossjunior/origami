import 'helpers'
import 'backlog'

type timeBoxTask = Epic| AtomicUserStory| TaskBacklog;

TimeBox:
    'timebox' id=ID '{'
        (
        Name
        |Description
        |'startDate'':' startDate=DATE
        |'endDate' ':' endDate=DATE
        )*
    '}' 
    ;

