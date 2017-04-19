'use strict';
import { searchAllIncludedKeyword } from './KeywordHelper';
import { Location, TextDocument, Range, Position, TextLine, Uri } from 'vscode';
import { allIncludedResources, getAllResourceRefferences } from './ResourceHelper';
import { WorkspaceContext } from '../WorkspaceContext';

export function getAllVariableReference(document: TextDocument, variable: string, position: Position)
    : Location[] {
    let origin = getVariableOrigin(document, variable);
    let result: Location[] = [];
    if (origin.uri != document.uri) {
        let originDoc = WorkspaceContext.getDocumentByUri(origin.uri);
        let reff = getAllResourceRefferences(originDoc);
        for (let i = 0; i < reff.length; i++) {
            let doc = reff[i];
            result = result.concat(getVariableRange(doc, variable));
        }
        return result;
    }
    else {
        if (isGlobalVariable(document, variable)) {
            result = result.concat(getVariableRange(document, variable));
        }
        else {
            result = getLocalVariable(document, variable, position);
        }
        return result;
    }
}

export function getLocalVariable(document: TextDocument, keyword: string, position: Position): Location[] {
    let startLine = document.lineAt(position).text;
    let startPos = position.line;
    let result: Location[] = getVariableOnLine(document, startLine, keyword, startPos);
    let isInKeyword = true;
    let up = true;
    let i = 0;
    while (isInKeyword) {
        if (up) {
            i++;
            let linePos = startPos - i;
            if (linePos > 0) {
                let line = document.lineAt(linePos).text;
                if (/^\S+/.test(line)) {
                    up = false;
                    i = 0;
                }
                else {
                    result = result.concat(getVariableOnLine(document, line, keyword, linePos));
                }
            }
            else {
                up = false;
                i = 0;
            }
        }
        else {
            i++;
            let linePos = i + startPos;
            if (linePos < document.lineCount) {
                let line = document.lineAt(linePos).text;
                if (/^\S+/.test(line)) {
                    isInKeyword = false;
                }
                else {
                    result = result.concat(getVariableOnLine(document, line, keyword, linePos));
                }
            }
            else {
                isInKeyword = false;
            }
        }
    }
    return result;
}

export function getVariableOnLine(document: TextDocument, line: string, keyword: string, linePosition: number): Location[] {
    let result: Location[] = [];
    let matches = line.match(/\$\{([^${}]+)\}/g);
    if (matches) {
        let found = 0;
        for (let k = 0; k < matches.length; k++) {
            let match = matches[k];
            if (match == "${" + keyword + "}") {
                found = line.indexOf(keyword, found);
                let range = new Range(
                    new Position(linePosition, found), new Position(linePosition, found + keyword.length)
                );
                result.push(new Location(document.uri, range));
            }
        }
    }
    return result;
}

export function getVariableRange(document: TextDocument, keyword: string): Location[] {
    let result: Location[] = [];
    for (let j = 0; j < document.lineCount; j++) {
        let line = document.lineAt(j).text;
        result = result.concat(getVariableOnLine(document, line, keyword, j));
    }
    return result;
}


export function isGlobalVariable(document: TextDocument, varName: string): boolean {
    if (getVariableOrigin(document, varName).uri != document.uri) {
        return true;
    }
    else {
        return isInGlobalVarState(document, varName);
    }
}

export function isInGlobalVarState(doc: TextDocument, varName: string): boolean {
    let isInField = false;
    for (let i = 0; i < doc.lineCount; i++) {
        let line = doc.lineAt(i).text;
        if (!isInField) {
            let match = line.match(/Set Global Variable\s{2,}\$\{([^${}]+)\}/g);
            if (match) {
                for (let j = 0; j < match.length; j++) {
                    if (match[j] == varName) return true;
                }
            }
            else {
                isInField = /^\*\*\*+\sVariable\s\*\*\*/.test(line);
            }
        }
        else {
            if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                isInField = false;
            }
            else {
                let match = line.match(/^\$\{([^${}]+)\}/)
                if (match) {
                    for (let j = 0; j < match.length; j++) {
                        if (match[j] == varName) return true;
                    }
                }
            }
        }
    }
    return false;
}

export function getVariableDefinition(location: Location): string {
    let doc = WorkspaceContext.getDocumentByUri(location.uri)
    let line = doc.lineAt(location.range.start).text;
    let match = line.match(/^\$\{(([-_.]*\w+\s*)+)\}\s{2,}((\S+\s?)+)\s*$/);
    if (match) {
        return match[3];
    }
}

export function getVariableByPosition(document: TextDocument, position: Position): string {
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

export function getVariableOrigin(document: TextDocument, varName: string): Location {
    let included = allIncludedResources(document);
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
                        let range = new Range(
                            new Position(j, found), new Position(j, varName.length + found)
                        );
                        return new Location(doc.uri, range);
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
                            let range = new Range(
                                new Position(j, found), new Position(j, varName.length + found)
                            );
                            return new Location(doc.uri, range);
                        }
                    }
                }
            }
        }
    }
    return null;
}

export function getVariablesNames(document: TextDocument, match: string): string[] {
    let included = allIncludedResources(document);
    let allVariablesNames = allAvailableVariables(document, included);
    return Array.from(new Set(allVariablesNames));
}

export function getVariables(document: TextDocument, match: string): string[] {
    let allVariablesNames = getVariablesNames(document, match);
    let allVariables = formatVariables(Array.from(new Set(allVariablesNames)));
    return allVariables;
}

export function allAvailableVariables(document: TextDocument, included
    : TextDocument[]): string[] {
    let allVar = searchAllVariables(document);
    for (let i = 0; i < included.length; i++) {
        allVar = allVar.concat(searchAllGlobalVariables(included[i]));
    }
    return allVar;
}

export function searchAllGlobalVariables(file: TextDocument): string[] {
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

export function searchAllVariables(file: TextDocument): string[] {
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

export function formatVariables(varNames: string[]): string[] {
    let varFormat: string[] = [];
    for (let i = 0; i < varNames.length; i++) {
        varFormat.push("{" + varNames[i] + "}");
    }
    return varFormat;
}