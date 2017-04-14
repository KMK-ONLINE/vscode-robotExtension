'use strict';

import vscode = require('vscode');
import fs = require('fs');
import {File} from './File';

export class KeywordProvider{

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
