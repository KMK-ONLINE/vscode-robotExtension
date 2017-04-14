'use strict';

import vscode = require('vscode');
import {File} from './File';

export class KeywordProvider{

    public static getKeywordByPosition(document:vscode.TextDocument, position:vscode.Position):string[]{
        let line = document.lineAt(position.line).text;
        let whiteSpace:number = 0;
        let index:number = 0;
        for(let i = position.character; i >= 0; i--){
            if(/\s/.test(line.charAt(i))){
                whiteSpace++;
                if(whiteSpace == 2){
                    index = i + 2;
                    break;
                }
            }
            else{
                whiteSpace = 0;
            }
        }
        line = line.substr(index);
        let match1 = line.match(/^(([-_]*\w+)+)\.((\w+\s?)+)/);
        let match2 = line.match(/^((\w+\s?)+)\s{2,}/);
        if(match1){
            return [match1[1], match1[3].replace(/\s+$/, "")];
        }
        else if(match2){
            return [match2[1].replace(/\s+$/, "")];
        }
        else{
            return null;
        }
    }

    public static getKeywordPosition(file:File, keyword:string):number{
        for(let i = 0; i < file.lineCount; i++){
            if(/^([-_]*\w+\s?)+/.test(file.lineAt(i))){
                if(file.lineAt(i).includes(keyword)){
                    return i;
                }
            }
        }
        return -1;
    }

    public static allIncludedKeywordsSearcher(files:File[]):string[]{
        let keywords:string[] = [];
        for(let i = 0; i < files.length; i++){
            keywords.push(files[i].fileNameWithNoExtension);
            let fileKeywords = KeywordProvider.keywordSearcher(files[i]);
            if(fileKeywords.length > 0){
                let fileAndKeywords = KeywordProvider.fileAndKeywordsMerger(files[i], fileKeywords);
                keywords = keywords.concat(fileAndKeywords);
            }
        }
        return keywords;
    }

    public static vscodeKeywordSearcher(file:vscode.TextDocument):string[]{
        return KeywordProvider.keywordSearcher(new File(file.fileName));
    }

    public static keywordSearcher(file:File):string[]{
        let keywords:string[] = [];
        let isInKeywordRange = false;
        for(let i = 0; i < file.lineCount; i++){
            let line = file.lineAt(i);
            if(!isInKeywordRange){
                isInKeywordRange = /^\*\*\*+\sKeywords\s\*\*\*/.test(line)
            }
            else{
                if(/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)){
                    isInKeywordRange = false;
                }
                else{
                    let match = line.match(/^((\w+\s?)+)$/);
                    if(match){
                        keywords.push(match[1]);
                    }
                }

            }
        }
        return keywords;
    }

    public static fileAndKeywordsMerger(file:File, keywords:string[]):string[]{
		let merges:string[] = [];
		let fileName = file.fileNameWithNoExtension;
		for(let i = 0; i < keywords.length; i++){
			merges.push(fileName + "." + keywords[i]);
		}
		return merges;
	}
}
