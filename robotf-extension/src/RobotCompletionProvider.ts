'use strict';

import vscode = require('vscode');
import {KeywordProvider} from './KeywordProvider';
import {ResourceProvider} from './ResourceProvider';
import {File} from './File';
export class RobotCompletionProvider implements vscode.CompletionItemProvider{
	
	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]{
		let thisFile = new File(document.fileName);
		let thisFileName = thisFile.fileNameWithNoExtension;
		let line = document.lineAt(position);
		let keywordMatcher1 = line.text.match(/^\s+(((_|-)*|\w+)+)$/);
		let keywordMatcher2 = line.text.match(/^\s+.+\s{2,}(((_|-)*|\w+)+)$/);
		let resourceMatcher1 = line.text.match(/^([rR][eE]?[sS]?[oO]?[uU]?[rR]?[cC]?[eE]?)$/);
		let resourceMatcher2 = line.text.match(/^Resource\s{2,}(\.?\.?\S*)$/);
		if(keywordMatcher1){
			return this.keywordMatcher(document, keywordMatcher1[1]);
		}
		else if(keywordMatcher2){
			return this.keywordMatcher(document, keywordMatcher2[1]);
		}
		else if(resourceMatcher1){
			return this.resourceMatcher(document, resourceMatcher1[0]);
		}
		else if(resourceMatcher2){
			return this.resourceCompleter(document, resourceMatcher2[1]);
		}
		else{
			return [];
		}
	}

	private keywordMatcher(document: vscode.TextDocument, fileName:string):vscode.CompletionItem[]{
		let included = ResourceProvider.allIncludedResources(document);
		let localKeywords = KeywordProvider.vscodeKeywordSearcher(document)
		let includedKeywords = KeywordProvider.allIncludedKeywordsSearcher(included);
		let allKeywords = localKeywords.concat(includedKeywords);
		let suggestionsString = RobotCompletionProvider.sentenceLikelyAnalyzer(fileName, allKeywords);
		return this.stringArrayToCompletionItems(suggestionsString);
	}

	private resourceCompleter(document: vscode.TextDocument, path:string):vscode.CompletionItem[]{
		let resources = ResourceProvider.allNearestResourcesPath(document);
		let resourceRelativePath = ResourceProvider.resourcesFormatter(document, "", resources);
		let suggestionsString = RobotCompletionProvider.sentenceLikelyAnalyzer(path, resourceRelativePath);
		return this.stringArrayToCompletionItems(suggestionsString);
	}

	private resourceMatcher(document: vscode.TextDocument, fileName:string):vscode.CompletionItem[]{
		let resources = ResourceProvider.allNearestResourcesPath(document);
		let includesFormat = ResourceProvider.autoResourcesFormatter(document, resources);
		let suggestionsString = RobotCompletionProvider.sentenceLikelyAnalyzer(fileName, includesFormat);
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
