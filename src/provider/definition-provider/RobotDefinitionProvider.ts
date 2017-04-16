'use strict';

import vscode = require('vscode');
import { ResourceHelper } from '../../helper/ResourceHelper';
import { KeywordHelper } from '../../helper/KeywordHelper';
import { Util } from '../../Util';
import { WorkspaceContext } from '../../WorkspaceContext';

export class RobotDefinitionProvider implements vscode.DefinitionProvider {

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        WorkspaceContext.scanWorkspace();
        return Promise.resolve(RobotDefinitionProvider.definitionProvider(document, position));
    }

    private static definitionProvider(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Definition> {
        let key = KeywordHelper.getKeywordByPosition(document, position);
        if (key != null) {
            if (key.length == 2) {
                return RobotDefinitionProvider.includedKeywordDefinition(document, key[0], key[1]);
            }
            else {
                return RobotDefinitionProvider.keywordDefinition(document, key[0]);
            }
        }
        return null;
    }

    private static keywordDefinition(document: vscode.TextDocument, keyword: string): vscode.ProviderResult<vscode.Definition> {
        let result;
        try {
            let resources = ResourceHelper.allIncludedResources(document);
            resources.push(document);
            let resource: string;
            let lineNumber: number;
            for (let i = 0; i < resources.length; i++) {
                lineNumber = KeywordHelper.getKeywordPosition(resources[i], keyword);
                if (lineNumber > 0) {
                    resource = resources[i].fileName;
                    break;
                }
            }
            result = new vscode.Location(vscode.Uri.file(resource), new vscode.Position(lineNumber, 0));
        }
        catch (e) {
            console.log(e);
        }
        finally {
            return result
        }
    }

    private static includedKeywordDefinition(document: vscode.TextDocument, file: string, keyword: string): vscode.ProviderResult<vscode.Definition> {
        let result;
        try {
            let resource = ResourceHelper.getResourceByName(file, document);
            let lineNumber = KeywordHelper.getKeywordPosition(resource, keyword);
            result = new vscode.Location(vscode.Uri.file(resource.fileName), new vscode.Position(lineNumber, 0));
        }
        catch (e) {
            console.log(e);
        }
        finally {
            return result
        }
    }

}