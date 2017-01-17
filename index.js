'use babel';

import { documentParser, MJMLValidator } from 'mjml'
import container from './container'

export default {
  activate() {
    window.mjml_disable_jquery = true
    require('atom-package-deps').install();
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
        return new Promise(resolve => {
          const filePath = TextEditor.getPath();
          const fileText = TextEditor.getText()
          const MJMLDocument = documentParser(fileText, {
            container: container(),
            defaultAttributes: {},
            cssClasses: {},
            css: [],
            fonts: []
          })
          const report = MJMLValidator(MJMLDocument)
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
