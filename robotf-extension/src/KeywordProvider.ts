'use strict';

import vscode = require('vscode');
import fs = require('fs');
import {File} from './File';

export class KeywordProvider{
    
    public static allIncludedResourceSearcher(document: vscode.TextDocument):File[]{
        let included = KeywordProvider.vscodeResourceSearcher(document);
        let indirectInclude:File[] = [];
        let temp:File[][] = [];
        let length = included.length;
        for(let i = 0; i<length; i++){
            temp.push(KeywordProvider.resourceSearcher(included[i]));
            if(temp[i]!= null){
                for(let j = 0; j < temp[i].length; j++){
                    included.push(temp[i][j]);
                }
            }
        }
        return included;
    }

    public static vscodeResourceSearcher(document:vscode.TextDocument):File[]{
        return KeywordProvider.resourceSearcher(new File(document.fileName));
    }

    public static resourceSearcher(document: File):File[]{
		let fileLength = document.lineCount;
		let resources:File[] = [];
		for(let i = 0; i < fileLength; i++){
			let line = document.lineAt(i);
			let matches = line.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
			if(matches){
                let docs = KeywordProvider.documentSearcher(document, matches[1]);
                resources.push(docs);
			}
        }
		return resources;
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

    public static searchFromFiles(files:File[], fileName:string):File{
        for(let i = 0; i < files.length; i++){
            if(files[i].fileName == fileName){
                return files[i];
            }
        }
        return null;
    }

    public static documentSearcher(thisDocument:File, filePath:string):File{
        let thisFolderPath = thisDocument.path.replace(/([!"#%&'*+,.:<=>@\_`~-]*|\w+)+\.\w+$/, "");
        while(filePath.match(/^\.\.\.?\//)){
            filePath = filePath.replace(/^\.\.\.?\//, "");
            thisFolderPath = thisFolderPath.replace(/([!"#%&'*+,.:<=>@\_`~-]*|\w+)+(\/|\\)$/, "");
        }
        let foundedPath = thisFolderPath + filePath;
        return new File(foundedPath);
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

    public static documentsToNames(documents:File[]):string[]{
        let converted:string[] = [];
        for(let i = 0; i < documents.length; i++){
            converted[i] = documents[i].fileNameWithNoExtension;
        }
        return converted;
    }

    public static vscodeDocumentsToNames(documents:File[]):string[]{
        let converted:string[]= [];
        for(let i = 0; i < documents.length; i++){
            converted[i] = documents[i].fileName.match(/(([!"#%&'*+,.:<=>@\_`~-]*|\w+)+)\.?\w*$/)[0].replace(/\.\w+$/, "");
        }
        return converted;
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
