'use strict';

import vscode = require('vscode');
import { ResourceHelper } from './ResourceHelper';
import { Util } from '../Util';
import {WorkspaceContext} from '../WorkspaceContext';

export class VariableHelper {

    public static getVariableDefinition(location:vscode.Location):string{
        let doc = WorkspaceContext.getDocumentByUri(location.uri)
        let line = doc.lineAt(location.range.start).text;
        let match = line.match(/^\$\{(([-_.]*\w+\s*)+)\}\s{2,}((\S+\s?)+)\s*$/);
        if(match){
            return match[2];
        }
    }

    public static getVariableByPosition(document: vscode.TextDocument, position: vscode.Position): string {
        let line = document.lineAt(position).text;
        let index = position.character;
        let match: boolean = false;
        for (let i = index - 1; i > 0; i--) {
            if (line.charAt(i) == "{") {
                match = true;
            }
            else if (line.charAt(i) == "$") {
                if (match) {
                    let temp = line.substr(i);
                    let varMatch = temp.match(/^\$\{(([-_.]*\w+\s*)+)\}/);
                    return varMatch[1];
                }
            }
            else {
                match = false;
            }
        }
        return null;
    }

    public static searchGlobalVarOrigin(document: vscode.TextDocument, varName: string): vscode.Location {
        let included = ResourceHelper.allIncludedResources(document);
        let all = [document].concat(included);
        let isInVarRange = false;
        for (let i = 0; i < all.length; i++) {
            let doc = all[i];
            for (let j = 0; j < doc.lineCount; j++) {
                let line = doc.lineAt(j).text;
                if (!isInVarRange) {
                    let match1 = line.match(/Set Global Variable\s{2,}\$\{(([-_.]*\w+\s*)+)\}/);
                    let match2 = line.match(/Set Suite Variable\s{2,}\$\{(([-_.]*\w+\s*)+)\}/);
                    let match: string[];
                    if (match1) {
                        match = match1;
                    }
                    else if (match2) {
                        match = match2
                    }
                    if (match) {
                        if (match[1] == varName) {
                            let found = line.indexOf(match[1]);
                            let range = new vscode.Range(new vscode.Position(j, found), new vscode.Position(j, varName.length + found));
                            return new vscode.Location(doc.uri, range);
                        }
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
                        let match = line.match(/^\$\{(([-_.]*\w+\s*)+)\}/);
                        if (match) {
                            if (match[1] == varName) {
                                let found = line.indexOf(match[1]);
                                let range = new vscode.Range(new vscode.Position(j, found), new vscode.Position(j, varName.length + found));
                                return new vscode.Location(doc.uri, range);
                            }
                        }
                    }
                }
            }
        }
    }

    public static getVariablesNames(document: vscode.TextDocument, match: string): string[] {
        let included = ResourceHelper.allIncludedResources(document);
        let allVariablesNames = VariableHelper.allAvailableVariables(document, included);
        return Array.from(new Set(allVariablesNames));
    }

    public static getVariables(document: vscode.TextDocument, match: string): string[] {
        let allVariablesNames = VariableHelper.getVariablesNames(document, match);
        let allVariables = VariableHelper.formatVariables(Array.from(new Set(allVariablesNames)));
        return allVariables;
    }

    public static allAvailableVariables(document: vscode.TextDocument, included: vscode.TextDocument[]): string[] {
        let allVar = VariableHelper.searchAllVariables(document);
        for (let i = 0; i < included.length; i++) {
            allVar = allVar.concat(VariableHelper.searchAllGlobalVariables(included[i]));
        }
        return allVar;
    }

    public static searchAllGlobalVariables(file: vscode.TextDocument): string[] {
        let variables: Set<string> = new Set();
        let isInVarRange = false;
        for (let i = 0; i < file.lineCount; i++) {
            let line = file.lineAt(i).text;
            if (!isInVarRange) {
                let match1 = line.match(/Set Global Variable\s{2,}\$\{(([-_.]*\w+\s*)+)\}/);
                let match2 = line.match(/Set Suite Variable\s{2,}\$\{(([-_.]*\w+\s*)+)\}/);
                let match: string[];
                if (match1) {
                    match = match1;
                }
                else if (match2) {
                    match = match2
                }
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
                    let match = line.match(/^\$\{(([-_.]*\w+\s*)+)\}/);
                    if (match) {
                        variables.add(match[1]);
                    }
                }
            }
        }
        return Array.from(variables);
    }

    public static searchAllVariables(file: vscode.TextDocument): string[] {
        let variables: Set<string> = new Set();
        for (let i = 0; i < file.lineCount; i++) {
            let line = file.lineAt(i).text;
            let match = line.match(/\$\{(([-_.]*\w+\s*)+)\}/);
            if (match) {
                variables.add(match[1]);
            }
        }
        return Array.from(variables);
    }

    public static formatVariables(varNames: string[]): string[] {
        let varFormat: string[] = [];
        for (let i = 0; i < varNames.length; i++) {
            varFormat.push("{" + varNames[i] + "}");
        }
        return varFormat;
    }
}