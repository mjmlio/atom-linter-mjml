'use babel';

import { documentParser, MJMLValidator } from 'mjml'
import find from 'lodash/find'

const getMJBody = (root) => find(root.children, ['tagName', 'mj-body'])

export default {
  activate() {
    require('atom-package-deps').install('linter-mjml');
    window.mjml_disable_jquery = true
  },

  deactivate() {
    window.mjml_disable_jquery = false
  },

  provideLinter() {
    return {
      name: 'MJML',
      scope: 'file',
      grammarScopes: ['text.mjml.basic'],
      lintsOnChange: false,
      lint: (TextEditor) => {
        return new Promise((resolve, reject) => {
          let MJMLDocument
          const filePath = TextEditor.getPath();
          const fileText = TextEditor.getText()

          try {
            MJMLDocument = documentParser(fileText)
          } catch (e) {
            reject(e)
          }

          const body = getMJBody(MJMLDocument)

          if (!body || !body.children || body.children.length == 0) {
            reject()
          }

          const report = MJMLValidator(body.children[0])
          const formattedError = report.map(e => {
            const line = e.line - 1
            const currentLine = TextEditor.getBuffer().lineForRow(e.line - 1)

            return {
              filePath,
              range: [[line, currentLine.indexOf('<')], [line, TextEditor.getBuffer().lineLengthForRow(line)]],
              type: 'Error',
              text: e.message
            }
          })
          resolve(formattedError)
        })
      }
    }
  }
}
