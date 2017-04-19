'use strict';

import { Location, TextDocument, Range, Position, TextLine, Uri } from 'vscode';
import { allIncludedResources } from './ResourceHelper';
import { WorkspaceContext } from '../WorkspaceContext';

    export function getVariableDefinition(location: Location): string {
        let doc = WorkspaceContext.getDocumentByUri(location.uri)
        let line = doc.lineAt(location.range.start).text;
        let match = line.match(/^\$\{(([-_.]*\w+\s*)+)\}\s{2,}((\S+\s?)+)\s*$/);
        if (match) {
            return match[2];
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

    export function searchGlobalVarOrigin(document: TextDocument, varName: string): Location {
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
                            let range = new Range(new Position(j, found), new Position(j, varName.length + found));
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
                                let range = new Range(new Position(j, found), new Position(j, varName.length + found));
                                return new Location(doc.uri, range);
                            }
                        }
                    }
                }
            }
        }
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

    export function allAvailableVariables(document: TextDocument, included: TextDocument[]): string[] {
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