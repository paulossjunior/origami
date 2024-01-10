grammar Origami

import 'helpers'
import 'terminals'
import 'projects'
import 'backlog'
import 'processes'

entry Model:    
    (project=Project)?
    (components+=(Process|Backlog))*

;


