import vscode = require('vscode');
import { ResourceHelper } from './ResourceHelper';
import { Util } from '../Util';

export class VariableHelper{
    public static getVariablesNames(document: vscode.TextDocument, match: string): string[] {
        let included = ResourceHelper.allIncludedResources(document);
        let allVariablesNames = VariableHelper.allAvailableVariables(document, included);
        let suggestionsString = Util.sentenceLikelyAnalyzer(match, Array.from(new Set(allVariablesNames)));
        return suggestionsString;
    }

    public static getVariables(document: vscode.TextDocument, match: string): string[] {
        let allVariablesNames = VariableHelper.getVariablesNames(document, match);
        let allVariables = VariableHelper.variablesFormatter(Array.from(new Set(allVariablesNames)));
        return allVariables;
    }

    public static allAvailableVariables(document: vscode.TextDocument, included: vscode.TextDocument[]): string[] {
        let allVar = VariableHelper.allVariablesSearcher(document);
        for (let i = 0; i < included.length; i++) {
            allVar = allVar.concat(VariableHelper.globalVariablesSearcher(included[i]));
        }
        return allVar;
    }

    public static globalVariablesSearcher(file: vscode.TextDocument): string[] {
        let variables: Set<string> = new Set();
        let isInVarRange = false;
        for (let i = 0; i < file.lineCount; i++) {
            let line = file.lineAt(i).text;
            if (!isInVarRange) {
                let match = line.match(/Set Global Variable\s{2,}\$\{([-_.]*\w+\s*)\}/);
                if (match) {
                    variables.add(match[1]);
                }
                else {
                    isInVarRange = /^\*\*\*+\sVariable\s\*\*\*/.test(line)
                }
            }
            else {
                if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                    isInVarRange = false;
                }
                else {
                    let match = line.match(/^\$\{([-_.]*\w+\s*)\}/);
                    if (match) {
                        variables.add(match[1]);
                    }
                }

            }
        }
        return Array.from(variables);
    }

    public static allVariablesSearcher(file: vscode.TextDocument): string[] {
        let variables: Set<string> = new Set();
        for (let i = 0; i < file.lineCount; i++) {
            let line = file.lineAt(i).text;
            let match = line.match(/\$\{([-_.]*\w+\s*)\}/);
            if (match) {
                variables.add(match[1]);
            }
        }
        return Array.from(variables);
    }

    public static variablesFormatter(varNames: string[]): string[] {
        let varFormat: string[] = [];
        for (let i = 0; i < varNames.length; i++) {
            varFormat.push("${" + varNames[i] + "}");
        }
        return varFormat;
    }
}