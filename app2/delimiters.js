export const DELIMITER_BRACKETS_SQUARE = /\[([^\]]*)]/mgi
export const DELIMITER_BRACKETS_CURLY = /\{([^\]]*)}/mgi
export const DELIMITER_BRACKETS_ROUND = /\(([^\]]*)\)/mgi
export const DELIMITER_POUND = /#([^\]]*)#/mgi

export const findPattern=(delimiter)=>{
    switch(delimiter){
        case '#':
            return DELIMITER_POUND
        case '{':
            return DELIMITER_BRACKETS_CURLY
        case '(':
            return DELIMITER_BRACKETS_ROUND
        case '[':
        default:
            return DELIMITER_BRACKETS_SQUARE
    }
}
