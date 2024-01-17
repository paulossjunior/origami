grammar Origami

import 'helpers'
import 'terminals'
import 'projects'
import 'backlog'
import 'processes'
import 'timebox'
import 'team'

entry Model:    
    (project=Project)
    (team?=Team)
    (components+=(Process|Backlog|TimeBox))*

;


