export interface ForLoopSyntax {
    x: string;
    sequence: string;
    statement: string;
}
export interface RangeFunctionParams {
    start: number;
    end?: number;
    step?: number;
}
interface SequenceObject {
    [key: string]: string | number | boolean;
}
export declare const isStatementObjectValid: (obj: Record<string, any>) => boolean;
export declare const getForLoopSyntax: (forLoopObject: ForLoopSyntax) => string;
export declare const getForLoopSyntaxInContent: (content: string) => ForLoopSyntax[] | undefined;
export declare const getStringifiedRangeFunctionParams: (stringifiedRange: string) => RangeFunctionParams | null;
export declare const getArrayFromRangeString: (stringifiedRange: string) => number[];
export declare const getSequenceArrayAsArray: (sequence: string) => (number | string | boolean | SequenceObject)[];
export declare const getSequenceArray: (sequence: string) => (number | string | boolean | SequenceObject)[];
export declare const getForLoopSyntaxResult: (forLoopSyntax: ForLoopSyntax) => string;
export declare const getContentWithReplacedForLoopsSyntax: (content: string) => string;
export {};
