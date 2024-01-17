import 'terminals'
import 'helpers'
Project:
    'project' name=STRING'{'
    (Identification 
    & Description 
    & 'email' ':' email=STRING
    & 'host' ':' host=STRING
    & 'token' ':' token=STRING
    )
    '}' 
    ;

Team: 'team' name=STRING '{'
    (teammember+=TeamMember)*
'}'
;

TeamMember:
    'teammember' '{' 
        'name' ':' name=STRING 
        & 'email' ':' email=ID 
    '}'
;