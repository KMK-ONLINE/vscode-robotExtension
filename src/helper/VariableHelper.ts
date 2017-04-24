'use strict';

import { Variable } from '../model/Variable';
import { TextDocument } from 'vscode';

/**
 * Function to search variables from the given document
 * 
 * @param file TextDocument object which will be searched
 * 
 * @return Array of variables found, it will return empty array if variables are not found
 */
export function searchVariables(file: TextDocument): Variable[] {
    let variables: Set<Variable> = new Set();
    let isInVariableField = false;
    for (let i = 0; i < file.lineCount; i++) {
        let line = file.lineAt(i).text;
        if (!isInVariableField) {
            isInVariableField = /^\*\*\*+\sVariable\s\*\*\*/i.test(line);
            if (!isInVariableField) {
                let match = line.match(/\$\{[^${}]+\}/g);
                if (match) {
                    let found = 0;
                    let end = 0;
                    for (let j = 0; j < match.length; j++) {
                        found = line.indexOf(match[j], found + end);
                        end = end + match[j].length;
                        let name = match[j].replace("${", "").replace("}", "");
                        let variable = Variable.generateVariable(file, name, false, i, found + 2);
                        variables.add(variable);
                    }
                }
            }
        }
        else {
            if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                isInVariableField = false;
            }
            else {
                if (/^\$\{[^${}]+\}/.test(line)) {
                    let temp = line.split(/\s{2,}/);
                    let name = temp[0].replace("${", "").replace("}", "");
                    let value = temp[1];
                    let variable = Variable.generateVariable(file, name, true, i, 2);
                    variable.value = value;
                    variable.isGlobal = true;
                    variables.add(variable);
                }
            }
        }
    }
    return Array.from(variables);
}

/**
 * Function to format variables into robot framework variables format
 * 
 * @param varNames variable names
 * 
 * @return string of formated variables
 */
export function formatVariables(varNames: string[]): string[] {
    let varFormat: string[] = [];
    for (let i = 0; i < varNames.length; i++) {
        varFormat.push("{" + varNames[i] + "}");
    }
    return varFormat;
}