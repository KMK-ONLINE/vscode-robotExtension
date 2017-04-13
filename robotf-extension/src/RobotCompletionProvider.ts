'use strict';

import vscode = require('vscode');
import {RobotDocUtil} from './RobotDocUtil';

export class RobotCompletionProvider implements vscode.CompletionItemProvider{
	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]{
		let thisFileName = RobotDocUtil.fileNameExtractor(document);
		let line = document.lineAt(position);
		let keywordSearcherMatch = line.text.match(/^\s+(.+)\.(.*)$/);
		let firstSearcherMatch = line.text.match(/^\s+(.+)$/);
		if(keywordSearcherMatch){
			return this.keywordMatch(document, keywordSearcherMatch[1], keywordSearcherMatch[2]);
		}
		else if(firstSearcherMatch){
			return this.fileMatch(document, firstSearcherMatch[1]);
		}
		else{
			return [];
		}
	}

	private keywordMatch(document: vscode.TextDocument, fileName:string, keyword:string):vscode.CompletionItem[]{
		let included = RobotDocUtil.allIncludedResourceSearcher(document);
		let file:vscode.TextDocument;
		for(let i = 0; i < included.length; i++){
			let includedName = RobotDocUtil.fileNameExtractor(included[i]);
			if(includedName.toUpperCase().includes(fileName.toLocaleUpperCase())){
				i = included.length;
				file = included[i];
			}
		}
		let keywords = RobotDocUtil.keywordSearcher(file);
		let suggestionsString:string[];
		if(keyword != ""){
			suggestionsString = RobotDocUtil.sentenceLikelyAnalyzer(keyword, keywords);
		}
		else{
			suggestionsString = keywords;
		}
		this.logArray(suggestionsString); //for testing
		return this.stringArrayToCompletionItems(suggestionsString);
	}

	private fileMatch(document: vscode.TextDocument, fileName:string):vscode.CompletionItem[]{
		let included = RobotDocUtil.allIncludedResourceSearcher(document);
		let includedString = RobotDocUtil.documentsToNames(included);
		this.logArray(includedString); //for testing
		let suggestionsString = RobotDocUtil.sentenceLikelyAnalyzer(fileName, includedString);
		return this.stringArrayToCompletionItems(suggestionsString);
	}

	private stringArrayToCompletionItems(suggestions:string[]):vscode.CompletionItem[]{
		let items:vscode.CompletionItem[];
		for(let i = 0; i < suggestions.length; i++){
			items.push(new vscode.CompletionItem(suggestions[i]));
		}
		return items;
	}

	private logArray(array:string[]){
		for(let i = 0; i < array.length; i++){
			console.log(array[i]);
		}
	}
}