grammar Origami

import 'helpers'
import 'terminals'
import 'projects'
import 'backlog'
import 'processes'
import 'timebox'

entry Model:    
    (project=Project)
    (team?=Team)
    (components+=(Process|Backlog|TimeBox))*

;


