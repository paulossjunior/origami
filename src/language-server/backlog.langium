import 'terminals'
import 'helpers'
import 'processes'

Backlog:
    'backlog' name=ID '{'
        (userstories += (Epic|AtomicUserStory))*
    '}' 
    ;

Epic :
    'epic' id=ID '{'(Name | process?=EpicProcess)*'}'
;

EpicProcess:
    'process' ':' type=[Process:QualifiedName]
;

AtomicUserStory :
    'userstory' id=ID '{' (Name | epic?=AtomicUserStoryEpic |activity?=AtomicUserStoryActivity)*'}'
;

AtomicUserStoryEpic:
    'epic' ':' type=[Epic:QualifiedName]
;

AtomicUserStoryActivity:
    'activity' ':' type=[Activity:QualifiedName]
;





