import 'terminals'
import 'helpers'

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