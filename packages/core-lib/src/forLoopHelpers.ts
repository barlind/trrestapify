import range from 'lodash.range'
import { replaceAll, replaceAllCastedVar } from './utils'
import { FOR_LOOP_SYNTAX_MATCHER, FOR_LOOP_SYNTAX_PREFIX, FOR_LOOP_SYNTAX_SUFFIX } from './const'
import { RestapifyErrorName } from './types'
const ELMT_BETWEEN_PARENTHESES_MATCHER = /\(([^)]+)\)/g
export interface ForLoopSyntax { x: string; sequence: string; statement: string }
interface SequenceObject { [key: string]: string | number | boolean }
export const getForLoopSyntaxInContent = (content: string): ForLoopSyntax[] | undefined => {
  const matches = [...content.matchAll(FOR_LOOP_SYNTAX_MATCHER)]
  if (!matches.length) return undefined
  return matches.map(m => ({ x: m[1], sequence: m[2], statement: m[3] }))
}
const getSequenceArray = (sequence: string): (number | string | boolean | SequenceObject)[] => {
  if (sequence.startsWith('[') && sequence.endsWith(']')) { sequence = replaceAll(sequence, '\'', '"'); return JSON.parse(sequence) }
  if (sequence.startsWith('range(') && sequence.endsWith(')')) {
    const paramsMatch = sequence.match(ELMT_BETWEEN_PARENTHESES_MATCHER)
    if (paramsMatch) {
      const parts = paramsMatch[0].substring(1, paramsMatch[0].length - 1).split(',')
      const start = Number(parts[0]); const end = parts[1] ? Number(parts[1]) : undefined; const step = parts[2] ? Number(parts[2]) : undefined
      return range(start, end, step)
    }
  }
  return []
}
const getForLoopSyntax = (s: ForLoopSyntax): string => `"${FOR_LOOP_SYNTAX_PREFIX} ${s.x} in ${s.sequence}",${s.statement},"${FOR_LOOP_SYNTAX_SUFFIX}"`
const isStatementObjectValid = (o: Record<string, any>): boolean => Object.keys(o).every(k => ['string','number','boolean'].includes(typeof o[k]))
const getForLoopSyntaxResult = (syntax: ForLoopSyntax): string => {
  const seq = getSequenceArray(syntax.sequence)
  const result: string[] = []
  seq.forEach(i => {
    let statement = syntax.statement
    if (typeof i === 'object') {
      if (!isStatementObjectValid(i)) { const error: RestapifyErrorName = 'INV:SYNTAX'; throw new Error(JSON.stringify({ error, message: 'Invalid object syntax in for loop' })) }
      Object.keys(i).forEach(k => { statement = replaceAllCastedVar(statement, `${syntax.x}.${k}`, (i as SequenceObject)[k].toString()); statement = replaceAll(statement, `[${syntax.x}.${k}]`, (i as SequenceObject)[k].toString()) })
    } else { statement = replaceAllCastedVar(statement, syntax.x, i.toString()); statement = replaceAll(statement, `[${syntax.x}]`, i.toString()) }
    result.push(statement)
  })
  return result.join(',')
}
export const getContentWithReplacedForLoopsSyntax = (content: string): string => {
  const loops = getForLoopSyntaxInContent(content)
  if (!loops) return content
  loops.forEach(loop => { const syntax = getForLoopSyntax(loop); content = content.replace(syntax, getForLoopSyntaxResult(loop)) })
  return getContentWithReplacedForLoopsSyntax(content)
}
