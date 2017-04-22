'use strict';

import { Location, TextDocument, Range, Position } from 'vscode';
import { Keyword } from '../model/Keyword';

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

export function searchKeywords(file: TextDocument): Keyword[] {
    let keywords: Keyword[] = [];
    let isInKeywordRange = false;
    for (let i = 0; i < file.lineCount; i++) {
        let line = file.lineAt(i).text;
        if (!isInKeywordRange) {
            isInKeywordRange = /^\*\*\*+\sKeywords\s\*\*\*/i.test(line)
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
                        if (/^\s{2,}\[Arguments\]/i.test(line)) {
                            args = line.split(/\s{2,}/).slice(2);
                            for (let j = 0; j < args.length; j++) {
                                args[j] = args[j].replace("${", "").replace("}", "");
                            }
                        }
                        else if (/^\s{2,}\[Return\]/i.test(line)) {
                            ret = line.split(/\s{2,}/)[2].replace("${", "").replace("}", "");
                        }
                        match = line.match(/^((\w+\s?)+)$/);
                        isInKeywordRange = !(/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line));
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

