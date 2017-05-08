'use strict';

import { isNullOrUndefined } from 'util';
import { WorkspaceContext } from '../WorkspaceContext';
import { Location, TextDocument, Range, Position } from 'vscode';
import { Keyword } from '../model/Keyword';
import { LIB } from '../dictionary/KeywordDictionary';

/**
 * Function to get keyword by its position
 * 
 * @param document TextDocument object which the keyword will be searched
 * @param position Position Object of the keyword
 * 
 * @return Array of string, if the keyword have specific locator, then it will return 2 string contains its file origin and its keyword
 */
export function getDocKeyByPos(document: TextDocument, position: Position): string[] {
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
        let sentences = line.split(/\s{2,}/)[0];
        let keyword = sentences.split(".");
        return keyword;
    }
}

/**
 * Function to search keywords from TextDocument
 * 
 * @param file TextDocument object
 * 
 * @return Array of Keyword found
 */
export function searchKeywords(file: TextDocument): Keyword[] {
    let keywords: Keyword[] = [];
    let isInKeywordRange = false;
    for (let i = 0; i < file.lineCount; i++) {
        let line = file.lineAt(i).text;
        if (!isInKeywordRange) {
            isInKeywordRange = /^\*\*\*+\sKeywords?\s\*\*\*/i.test(line)
        }
        else {
            if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                isInKeywordRange = false;
            }
            else {
                let match = line.match(/^((\w+\s?)+)$/);
                if (match) {
                    let keyword = match[1].replace(/\s+$/, "");
                    let args: string[] = [];
                    let ret: string = "";
                    let start = new Position(i, 0);
                    let end = new Position(i, keyword.length);
                    let range = new Range(start, end);
                    let loc = new Location(file.uri, range);
                    do {
                        i++;
                        line = file.lineAt(i).text;
                        if (!isNullOrUndefined(line)) {
                            if (/^\s{2,}\[Arguments\]/i.test(line)) {
                                args = line.split(/\s{2,}/).slice(2);
                                for (let j = 0; j < args.length; j++) {
                                    args[j] = args[j].replace("${", "").replace("}", "");
                                }
                            }
                            else if (/^\s{2,}\[Return\]/i.test(line)) {
                                let retur = line.split(/\s{2,}/)[2];
                                if (!isNullOrUndefined(retur)) {
                                    ret = retur.replace("${", "").replace("}", "");
                                }
                            }
                            match = line.match(/^((\w+\s?)+)$/);
                            isInKeywordRange = !(/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line));
                        }
                    } while (ret == "" && match == null && i < file.lineCount - 1 && isInKeywordRange);
                    i--;
                    let key = new Keyword(keyword, loc, args, ret);
                    keywords.push(key);
                }
            }

        }
    }
    return keywords;
}

/**
 * Function to read default library on config file. it still using dictionary but it will updated later
 */
export function getConfigLibrary(): string[] {
    let conf = WorkspaceContext.getConfig();
    let libKey: string[] = [];
    if (!isNullOrUndefined(conf)) {
        if (!isNullOrUndefined(conf.lib)) {
            if (Array.isArray(conf.lib)) {
                for (let i = 0; i < conf.lib.length; i++) {
                    for (let j = 0; j < LIB.length; j++) {
                        if (LIB[j].name == conf.lib[i]) {
                            libKey = libKey.concat(LIB[j].key);
                        }
                    }
                }
            }
        }
    }
    return libKey;
}

