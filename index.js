'use babel';

import mjml from 'mjml'
import { components } from 'mjml-core'
import MJMLParser from 'mjml-parser-xml'
import MJMLValidator from 'mjml-validator'

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
            MJMLDocument = MJMLParser(fileText, {
              components,
              filePath: '.',
            })
          } catch (e) {
            reject(e)
          }

          const errors = MJMLValidator(MJMLDocument, { components })

          const formattedError = errors.map(e => {
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
