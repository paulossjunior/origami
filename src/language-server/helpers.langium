import 'terminals'


fragment Identification:
    'id' ':' Identification=ID
;

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