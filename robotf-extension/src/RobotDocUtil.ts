'use strict';

import vscode = require('vscode');

export class RobotDocUtil{

    public static allIncludedResourceSearcher(document: vscode.TextDocument):vscode.TextDocument[]{
        let included = RobotDocUtil.resourceSearcher(document);
        let indirectInclude:vscode.TextDocument[];
        let temp:vscode.TextDocument[][];
        let length = included.length;
        for(let i = 0; i<length; i++){
            temp.push(RobotDocUtil.resourceSearcher(included[i]));
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
			let matches = line.text.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
			if(matches){
                let docs = RobotDocUtil.documentSearcher(document, matches[1]);
                resources.push(docs);
			}
        }
		return resources;
	}

	public static outsideResourceSearcher(thisDocument:vscode.TextDocument):vscode.TextDocument[]{
        let included = RobotDocUtil.allIncludedResourceSearcher(thisDocument);
        let notIncluded:vscode.TextDocument[];
        let workspace = vscode.workspace.textDocuments;
        for(let i = 0; i < workspace.length; i++){
            let same = false;
            for(let j = 0; j < included.length; j++){
                if(workspace[i]==included[j]){
                    same = true;
                    j = included.length;
                }
                if(!same && /\.[robot|txt]$/.test(workspace[i].fileName)){
                    notIncluded.push(workspace[i]);
                }
            }
        }
        return notIncluded;
	}

    public static fileNameExtractor(file:vscode.TextDocument):string{
        let fileName = file.fileName;
        fileName = fileName.replace(/\.\w+$/, "");
        let match = fileName.match(/(\w+)$/);
        return match[1];
    }

    public static documentSearcher(thisDocument:vscode.TextDocument, filePath:string):vscode.TextDocument{
        let thisFolderPath = thisDocument.fileName.replace(/\w+.\w+$/, "");
        while(filePath.match(/^\.\.\.?\//)){
            filePath = filePath.replace(/^\.\.\.?\//, "");
            thisFolderPath = thisFolderPath.replace(/(\w+-?)+\/$/, "");
        }
        let foundedPath = thisFolderPath + filePath;
        let workspace = vscode.workspace.findFiles(foundedPath);
        for(let i = 0, index = 0; i < workspace.length; i++){
            if(workspace[i].fileName == foundedPath)
                return workspace[i];
        }
        return null;
    }

    public static keywordSearcher(file:vscode.TextDocument):string[]{
        let keywords:string[];
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
                    let match = line.text.match(/^(\w+\s?)+$/);
                    if(match){
                        keywords.push(match[1]);
                    }
                }

            }
        }
        return keywords;
    }

    public static sentenceLikelyAnalyzer(sentence:string, suggestions:string[]):string[]{
        let suggestLikely:string[];
        for(let i = 0; i < suggestions.length; i++){
            if(suggestions[i].toUpperCase().includes(sentence.toUpperCase())){
                suggestLikely.push(suggestions[i]);
            }
        }
        return suggestions;
    }

    public static documentsToNames(documents:vscode.TextDocument[]):string[]{
        let converted:string[]
        for(let i = 0; i < documents.length; i++){
            converted[i] = RobotDocUtil.fileNameExtractor(documents[i]);
        }
        return converted;
    }
}
