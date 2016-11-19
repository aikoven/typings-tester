import * as ts from "typescript";


function handleDiagnostics(type: string, diagnostics: ts.Diagnostic[]) {
  for (const diagnostic of diagnostics) {
    const {line, character} =
      diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const message =
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    throw new Error(`${type}: ${diagnostic.file.fileName} ` +
                    `(${line + 1}, ${character + 1}): ${message}`);
  }
}

function forEachExpectedFailureNodes(node: ts.Node,
                                     cb: (node: ts.Node) => void) {
  if (node.kind !== ts.SyntaxKind.SourceFile &&
      node.getFullText().match(/^\s*\/[\/*] typings:expect-error/)) {
    cb(node);
  } else {
    ts.forEachChild(node, child => {
      forEachExpectedFailureNodes(child, cb);
    });
  }
}


export function check(files: string[], tsConfigPath: string) {
  const {config, error} = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  }

  const program = ts.createProgram(files, config.compilerOptions);

  handleDiagnostics('Global', program.getGlobalDiagnostics());
  handleDiagnostics('Syntactic', program.getSyntacticDiagnostics());

  for (const sourceFile of program.getSourceFiles()) {
    let semantic = program.getSemanticDiagnostics(sourceFile);

    if (program.getRootFileNames().indexOf(sourceFile.fileName) !== -1) {
      forEachExpectedFailureNodes(sourceFile, node => {
        const failures: ts.Diagnostic[] = [];
        const leftSemantics: ts.Diagnostic[] = [];

        for (const diag of semantic) {
          if (node.pos <= diag.start && diag.start + diag.length <= node.end) {
            failures.push(diag);
          } else {
            leftSemantics.push(diag);
          }
        }

        if (failures.length === 0) {
          const {line, character} =
            sourceFile.getLineAndCharacterOfPosition(node.getStart());
          throw new Error(`Expected error: ${sourceFile.fileName} ` +
                          `(${line + 1}, ${character + 1}):\n` +
                          node.getText());
        }

        semantic = leftSemantics;
      });
    }

    handleDiagnostics('Semantic', semantic);
  }
}

export function checkDirectory(path: string) {
  const files = ts.sys.readDirectory(path, ['.ts', '.tsx']);
  const tsConfigPath = ts.findConfigFile(path, ts.sys.fileExists);

  check(files, tsConfigPath);
}

