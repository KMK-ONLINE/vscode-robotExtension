'use strict';

import vscode = require('vscode');
import {KeywordProvider} from './KeywordProvider';
import {File} from './File';
export class RobotCompletionProvider implements vscode.CompletionItemProvider{
	
	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]{
		let thisFile = new File(document.fileName);
		let thisFileName = thisFile.fileNameWithNoExtension;
		let line = document.lineAt(position);
		let firstMatcher = line.text.match(/^\s+(((_|-)*|\w+)+)$/);
		let secondMatcher = line.text.match(/\s{2,}(((_|-)*|\w+)+)$/)
		if(firstMatcher){
			return this.matcher(document, firstMatcher[1]);
		}
		else if(secondMatcher){
			return this.matcher(document, secondMatcher[1]);
		}
		else{
			return [];
		}
	}

	private matcher(document: vscode.TextDocument, fileName:string):vscode.CompletionItem[]{
		let included = KeywordProvider.allIncludedResourceSearcher(document);
		let localKeywords = KeywordProvider.vscodeKeywordSearcher(document)
		let includedKeywords = KeywordProvider.allIncludedKeywordsSearcher(included);
		let allKeywords = localKeywords.concat(includedKeywords);
		let suggestionsString = RobotCompletionProvider.sentenceLikelyAnalyzer(fileName, allKeywords);
		return this.stringArrayToCompletionItems(suggestionsString);
	}

	private stringArrayToCompletionItems(suggestions:string[]):vscode.CompletionItem[]{
		let items:vscode.CompletionItem[] = [];
		for(let i = 0; i < suggestions.length; i++){
			items.push(new vscode.CompletionItem(suggestions[i]));
		}
		return items;
	}

	public static sentenceLikelyAnalyzer(sentence:string, suggestions:string[]):string[]{
        let suggestLikely:string[] = [];
        let search = sentence.toUpperCase();
        for(let i = 0; i < suggestions.length; i++){
            let options = suggestions[i].toUpperCase();
            if(options.includes(search)){
                suggestLikely.push(suggestions[i]);
            }
        }
        return suggestLikely;
    }
}
