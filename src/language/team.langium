import 'helpers'

Team: 'team' id=ID '{'
    (teammember+=TeamMember)*
'}'
;

TeamMember:
    'teammember' id=ID '{' 
        ('name' ':' name=STRING | 'email' ':' email=STRING)*  
    '}'
;