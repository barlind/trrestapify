import { HttpVerb, CastingOperator } from './types'

export const CURRENT_LOCATION_ROUTE_SELECTOR = '_'
export const HTTP_VERBS: HttpVerb[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
export const INTERNAL_BASEURL = '/restapify'
export const INTERNAL_API_BASEURL = `${INTERNAL_BASEURL}/api`

export const CASTING_OPERATORS: CastingOperator[] = ['number', 'boolean']
export const NUMBER_CAST_INDICATOR = 'n:'
export const BOOLEAN_CAST_INDICATOR = 'b:'

export const EMPTY_BODY_SYNTAX = [null]
export const HEADER_SYNTAX = '#header'
export const BODY_SYNTAX = '#body'

export const QUERY_STRING_VAR_MATCHER = /\[q:(.*?)\]/g
export const QS_VAR_DEFAULT_SEPARATOR = '|'

// eslint-disable-next-line max-len
export const FOR_LOOP_SYNTAX_MATCHER = /"#for ((?:(?!"#for .*? in .*?",|"#endfor").)*?) in ((?:(?!"#for .*? in .*?",|"#endfor").)*?)",((?:(?!#for .*? in .*?",|"#endfor").)*?),"#endfor"/g
export const FOR_LOOP_SYNTAX_PREFIX = '#for'
export const FOR_LOOP_SYNTAX_SUFFIX = '#endfor'
