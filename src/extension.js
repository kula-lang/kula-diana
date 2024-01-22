const vscode = require('vscode')

const formatRules = [
    [/(?<=\b|>>)\s*(\+|-|\*|\/|\%|=|>|<|:=|>=|<=|==|and|or|&&|\|\|)\s*(?=\b|<<)/g, ' $1 '],
    [/\)\s*\{/g, ') {'],
    [/\(\s+\)/g, '()'],
    [/([a-zA-Z_]\w*)\s*(\{)/g, '$1 $2'],
    [/([a-zA-Z_]\w*)\s*(\(|\))/g, '$1$2'],
    [/\b\s*,\s*\b/g, ', '],
    [/(if|else|for|func|while|class|print)\s*(?=\{|\(|\b|<<)/g, '$1 '],
    [/\s+;/g, ';']
]

const stringsRule = /(['"`])(\\['"`]|.)*?\1/gs
const commentsRule = /#.*?$/gm
const leftBracketsRule = /[\{\(\[]/g
const rightBracketsRule = /[\}\)\]]/g

exports.activate = function (context) {
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
        'kula', {
        provideDocumentFormattingEdits(document, options, token) {
            const result = []
            const start = new vscode.Position(0, 0)
            const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            const range = new vscode.Range(start, end)
            let text = document.getText(range)

            // protect strings & comments
            const strings = []
            const comments = []
            const protectHash = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
            const stringsRecoveryRule = `<<STRING${protectHash}>>`
            const commentsRecoveryRule = `<<COMMENT${protectHash}>>\n`
            text = text.replace(stringsRule, function (match) {
                strings.push(match)
                return stringsRecoveryRule
            }).replace(commentsRule, function (match) {
                comments.push(match)
                return commentsRecoveryRule
            })
            // rules replacement
            for (const rule of formatRules) {
                text = text.replace(rule[0], rule[1])
            }
            // calculate indent
            let indent = 0
            const rows = text.split('\n')
            text = rows.map(row => {
                row = row.trim()
                const il = row.match(leftBracketsRule)
                const ir = row.match(rightBracketsRule)
                const delta = (il === null ? 0 : il.length) - (ir === null ? 0 : ir.length)
                row = ' '.repeat(options.tabSize * (indent + (delta < 0 ? delta : 0))) + row
                indent = Math.max(0, indent + delta)
                return row
            }).map(row => /^\s*$/.test(row) ? '' : row).join('\n')

            // recovery strings & comments
            text = text
                .replace(new RegExp(stringsRecoveryRule, 'g'), () => strings.shift())
                .replace(new RegExp(commentsRecoveryRule, 'g'), () => comments.shift().trimRight())


            result.push(new vscode.TextEdit(range, text))
            return result
        }
    }))
}


exports.deactivate = function () {
}