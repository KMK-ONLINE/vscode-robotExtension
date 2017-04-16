'use strict';

import vscode = require('vscode');
import { LIB } from './CommonKeywordDictionary';
import { Util } from './Util';

export class KeywordProvider {

    public static getKeywordLibrary(included: vscode.TextDocument[]): string[] {
        let allLibs: Set<string> = new Set();
        for (let i = 0; i < included.length; i++) {
            let libs = KeywordProvider.includedLibrarySearcher(included[i]);
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

    private static includedLibrarySearcher(file: vscode.TextDocument): string[] {
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
        let match2 = line.match(/^((\w+\s?)+)\s{2,}/);
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

    public static getKeywordPosition(file: vscode.TextDocument, keyword: string): number {
        for (let i = 0; i < file.lineCount; i++) {
            if (/^([-_]*\w+\s?)+/.test(file.lineAt(i).text)) {
                if (file.lineAt(i).text.includes(keyword)) {
                    return i;
                }
            }
        }
        return -1;
    }

    public static allIncludedKeywordsSearcher(files: vscode.TextDocument[]): string[] {
        let keywords: string[] = [];
        for (let i = 0; i < files.length; i++) {
            keywords.push(Util.extractFileNameWithNoExtension(files[i].fileName));
            let fileKeywords = KeywordProvider.keywordSearcher(files[i]);
            if (fileKeywords.length > 0) {
                let fileAndKeywords = KeywordProvider.fileAndKeywordsMerger(files[i], fileKeywords);
                keywords = keywords.concat(fileAndKeywords);
            }
        }
        return keywords;
    }

    public static keywordSearcher(file: vscode.TextDocument): string[] {
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

    public static fileAndKeywordsMerger(file: vscode.TextDocument, keywords: string[]): string[] {
        let merges: string[] = [];
        let fileName = Util.extractFileNameWithNoExtension(file.fileName);
        for (let i = 0; i < keywords.length; i++) {
            merges.push(fileName + "." + keywords[i]);
        }
        return merges;
    }
}
