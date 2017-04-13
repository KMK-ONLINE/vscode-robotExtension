'use strict';

import vscode = require('vscode');

export class Util{

    public static allIncludedResourceSearcher(document: vscode.TextDocument):vscode.TextDocument[]{
        let included = Util.resourceSearcher(document);
        let indirectInclude:vscode.TextDocument[];
        let temp:vscode.TextDocument[][];
        let length = included.length;
        for(let i = 0; i<length; i++){
            temp.push(Util.resourceSearcher(included[i]));
            if(temp[i]!= null){
                for(let j = 0; j < temp[i].length; j++){
                    included.push(temp[i][j]);
                }
            }
        }
        return included;
    }

    public static resourceSearcher(document: vscode.TextDocument):vscode.TextDocument[]{
		let fileLength = document.lineCount;
		let resources:vscode.TextDocument[];
		for(let i = 0; i < fileLength; i++){
			let line = document.lineAt(i);
			let matches = line.text.match(/^Resource\s+(\w+)\s*$/);
			if(matches){
				resources.push(Util.documentSearcher(document, matches[1]));
			}
        }
		return resources;
	}

	public static outsideResourceSearcher(thisDocument:vscode.TextDocument):vscode.TextDocument[]{
        let included = Util.allIncludedResourceSearcher(thisDocument);
        let notIncluded:vscode.TextDocument[];
        let workspace = vscode.workspace.textDocuments;
        for(let i = 0; i < workspace.length; i++){
            let same = false;
            for(let j = 0; j < included.length; j++){
                if(workspace[i]==included[j]){
                    same = true;
                    j = included.length;
                }
                if(!same)
                    notIncluded.push(workspace[i]);
            }
        }
        return notIncluded;
	}

    public static fileNameExtractor(file:vscode.TextDocument):String{
        let fileName = file.fileName;
        fileName = fileName.replace(/\.\w+$/, "");
        let match = fileName.match(/^[.*\/]*(w+)$/);
        return match[1];
    }

    public static documentSearcher(thisDocument:vscode.TextDocument, filePath:String):vscode.TextDocument{
        let thisFolderPath = thisDocument.fileName.replace(/\w+.\w+/, "");
        while(filePath.match(/^\.\.\.?\//)){
            filePath = filePath.replace(/^\.\.\.?\//, "");
            thisFolderPath = thisFolderPath.replace(/\w+\/$/, "");
        }
        let foundedPath = thisFolderPath + filePath;
        let workspace = vscode.workspace.textDocuments;
        for(let i = 0, index = 0; i < workspace.length; i++){
            if(workspace[i].fileName == foundedPath)
                return workspace[i];
        }
        return null;
    }

    public static keywordSearcher(file:vscode.TextDocument):String[]{
        let keywords:String[];
        let isInKeywordRange = false;
        for(let i = 0; i < file.lineCount; i++){
            let line = file.lineAt(i);
            if(!isInKeywordRange){
                isInKeywordRange = /^\*\*\*+\sKeywords\s\*\*\*/.test(line.text)
            }
            else{
                if(/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line.text)){
                    isInKeywordRange = false;
                }
                else{
                    let match = line.text.match(/^\s*\t\s*+(.*)$/);
                    if(match){
                        keywords.push(match[1]);
                    }
                }

            }
        }
        return keywords;
    }

    public static sentenceLikelyAnalyzer(sentence:String, suggestions:String[]):String[]{
        let suggestLikely;
        return;
    }
}