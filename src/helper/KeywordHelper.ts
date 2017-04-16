'use strict';

import vscode = require('vscode');
import { LIB } from './KeywordDictionary';
import { Util } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';
import { ResourceHelper } from './ResourceHelper';

export class KeywordHelper {

    public static getKeywordOrigin(document: vscode.TextDocument, keyword: string): vscode.Location {
        let result;
        try {
            let resources = ResourceHelper.allIncludedResources(document);
            resources.push(document);
            let resource: string;
            let position: vscode.Range;
            for (let i = 0; i < resources.length; i++) {
                position = KeywordHelper.getKeywordDeclarationPosition(resources[i], keyword);
                if (position != null) {
                    resource = resources[i].fileName;
                    break;
                }
            }
            result = new vscode.Location(vscode.Uri.file(resource), position);
        }
        catch (e) {
            console.log(e);
        }
        finally {
            return result
        }
    }

    public static getIncludedKeywordOrigin(document: vscode.TextDocument, file: string, keyword: string): vscode.Location {
        let result;
        try {
            let resource = ResourceHelper.getResourceByName(file, document);
            let range = KeywordHelper.getKeywordDeclarationPosition(resource, keyword);
            result = new vscode.Location(vscode.Uri.file(resource.fileName), range);
        }
        catch (e) {
            console.log(e);
        }
        finally {
            return result
        }
    }

    public static getAllKeywordReferences(document: vscode.TextDocument, keyword: string): vscode.Location[] {
        let refference = ResourceHelper.getAllResourceRefferences(document);
        let keyLength = keyword.length;
        let locations: vscode.Location[] = [];
        for (let i = 0; i < refference.length; i++) {
            for (let j = 0; j < refference[i].lineCount; j++) {
                let line = refference[i].lineAt(j).text;
                let found = line.indexOf(keyword, 0);
                if (found >= 0) {
                    let indexes: number[] = [];
                    do {
                        let start = found + keyLength;
                        let range = new vscode.Range(new vscode.Position(j, found), new vscode.Position(j, start));
                        locations.push(new vscode.Location(refference[i].uri, range))
                        found = line.indexOf(keyword, start);
                    } while (found >= 0);
                }

            }
        }
        return locations;
    }

    public static getKeywordLibrary(included: vscode.TextDocument[]): string[] {
        let allLibs: Set<string> = new Set();
        for (let i = 0; i < included.length; i++) {
            let libs = KeywordHelper.searchIncludedLibrary(included[i]);
            for (let j = 0; j < libs.length; j++) {
                allLibs.add(libs[j]);
            }
        }
        let arrLibs = Array.from(allLibs);
        let keywords: string[] = [];
        for (let i = 0; i < arrLibs.length; i++) {
            for (let j = 0; j < LIB.length; j++) {
                if (LIB[j].name == arrLibs[i]) {
                    keywords = keywords.concat(LIB[j].key);
                }
            }
        }
        return keywords;
    }

    private static searchIncludedLibrary(file: vscode.TextDocument): string[] {
        let libs: string[] = [];
        for (let i = 0; i < file.lineCount; i++) {
            let match = file.lineAt(i).text.match(/^Library\s+(\w+)/);
            if (match) {
                libs.push(match[1]);
            }
        }
        return libs;
    }

    public static getKeywordByPosition(document: vscode.TextDocument, position: vscode.Position): string[] {
        let line = document.lineAt(position.line).text;
        let whiteSpace: number = 0;
        let index: number = 0;
        if (/^([-_]*\w+\s?)+\s*$/.test(line)) {
            return [line.replace(/\s+$/, '')];
        }
        else {
            for (let i = position.character; i >= 0; i--) {
                if (/\s/.test(line.charAt(i))) {
                    whiteSpace++;
                    if (whiteSpace == 2) {
                        index = i + 2;
                        break;
                    }
                }
                else {
                    whiteSpace = 0;
                }
            }
            line = line.substr(index);
            let match1 = line.match(/^(([-_]*\w+)+)\.((\w+\s?)+)/);
            let match2 = line.match(/^((\w+\s?)+)(\s{2,})?$/);
            if (match1) {
                return [match1[1], match1[3].replace(/\s+$/, "")];
            }
            else if (match2) {
                return [match2[1].replace(/\s+$/, "")];
            }
            else {
                return null;
            }
        }
    }

    public static getKeywordDeclarationPosition(file: vscode.TextDocument, keyword: string): vscode.Range {
        for (let i = 0; i < file.lineCount; i++) {
            if (/^([-_]*\w+\s?)+/.test(file.lineAt(i).text)) {
                if (file.lineAt(i).text.includes(keyword)) {
                    return new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, keyword.length - 1));
                }
            }
        }
        return null;
    }

    public static searchAllIncludedKeyword(files: vscode.TextDocument[]): string[] {
        let keywords: string[] = [];
        for (let i = 0; i < files.length; i++) {
            keywords.push(Util.extractFileNameWithNoExtension(files[i].fileName));
            let fileKeywords = KeywordHelper.searchKeyword(files[i]);
            if (fileKeywords.length > 0) {
                let fileAndKeywords = KeywordHelper.mergeFileAndKeyword(files[i], fileKeywords);
                keywords = keywords.concat(fileAndKeywords);
            }
        }
        return keywords;
    }

    public static searchKeyword(file: vscode.TextDocument): string[] {
        let keywords: string[] = [];
        let isInKeywordRange = false;
        for (let i = 0; i < file.lineCount; i++) {
            let line = file.lineAt(i).text;
            if (!isInKeywordRange) {
                isInKeywordRange = /^\*\*\*+\sKeywords\s\*\*\*/.test(line)
            }
            else {
                if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                    isInKeywordRange = false;
                }
                else {
                    let match = line.match(/^((\w+\s?)+)$/);
                    if (match) {
                        keywords.push(match[1]);
                    }
                }

            }
        }
        return keywords;
    }

    public static mergeFileAndKeyword(file: vscode.TextDocument, keywords: string[]): string[] {
        let merges: string[] = [];
        let fileName = Util.extractFileNameWithNoExtension(file.fileName);
        for (let i = 0; i < keywords.length; i++) {
            merges.push(fileName + "." + keywords[i]);
        }
        return merges;
    }
}
