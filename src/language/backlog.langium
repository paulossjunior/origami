
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
        |process=EpicProcess)*
        '}'
;

EpicProcess:
    'process' ':' type=[Process:QualifiedName]
;

AtomicUserStory :
    'userstory' id=ID '{' 
        (Name 
        | Description
        | epic=AtomicUserStoryEpic 
        |activity=AtomicUserStoryActivity
        )*'}'
;

AtomicUserStoryEpic:
    'epic' ':' type=[Epic:QualifiedName]
;

AtomicUserStoryActivity:
    'activity' ':' type=[Activity:QualifiedName]
;

TaksBacklog:
    'task' id=ID '{'
        (Name 
        |Description 
        |userstory=AtomicUserStoryTask)*
        '}'
;

AtomicUserStoryTask:
    'userstory' ':' type=[AtomicUserStory:QualifiedName]
;




