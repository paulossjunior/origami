grammar Origami

import 'helpers'
import 'terminals'
import 'projects'
import 'backlog'
import 'processes'
import 'timebox'

entry Model:    
    (project=Project)
    (components+=(Process|Backlog|TimeBox))*

;


