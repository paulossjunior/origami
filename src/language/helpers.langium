import 'terminals'

QualifiedName returns string:
    ID ('.' ID)*
;

QualifiedNameWithWildcard returns string:
    QualifiedName '.*'?
;

fragment Description:
    'description' ':' description=STRING
;

fragment Name:
    'name' ':' name=STRING
;

fragment Identification:
    'id' ':' Identification=ID
;

fragment FullName: 
    'fullName' ':' fullName = STRING
;

fragment DefinitionDone:
    'DoD' ':' dod=STRING (',' dod+=STRING)*
;

fragment DefinitionReady:
    'DoR' ':' dor=STRING (',' dor+=STRING)*
;

fragment Learning:
    'learning'':'  value=STRING (',' value+=STRING)*
;