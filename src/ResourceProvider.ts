'use strict';

import vscode = require('vscode');
import { Util } from './Util';
import { WorkspaceContext } from './WorkspaceContext';

export class ResourceProvider {

    public static getResourceByName(resourceName: string, document: vscode.TextDocument): vscode.TextDocument {
        let files = ResourceProvider.allIncludedResources(document);
        files.push(document);
        for (let i = 0; i < files.length; i++) {
            if (resourceName == Util.extractFileNameWithNoExtension(files[i].fileName)) {
                return files[i];
            }
        }
    }

    public static allIncludedResources(document: vscode.TextDocument): vscode.TextDocument[] {
        let included = ResourceProvider.resourceSearcher(document);
        let indirectInclude: vscode.TextDocument[] = [];
        let temp: vscode.TextDocument[][] = [];
        let length = included.length;
        for (let i = 0; i < length; i++) {
            temp.push(ResourceProvider.resourceSearcher(included[i]));
            if (temp[i] != null) {
                for (let j = 0; j < temp[i].length; j++) {
                    included.push(temp[i][j]);
                }
            }
        }
        return included;
    }

    public static resourceSearcher(document: vscode.TextDocument): vscode.TextDocument[] {
        let fileLength = document.lineCount;
        let resources: vscode.TextDocument[] = [];
        for (let i = 0; i < fileLength; i++) {
            let line = document.lineAt(i).text;
            let matches = line.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
            if (matches) {
                let docs = ResourceProvider.documentSearcher(document, matches[1]);
                resources.push(docs);
            }
        }
        return resources;
    }

    public static searchFileByName(files: vscode.TextDocument[], fileName: string): vscode.TextDocument {
        for (let i = 0; i < files.length; i++) {
            if (files[i].fileName == fileName) {
                return files[i];
            }
        }
        return null;
    }

    public static documentSearcher(thisDocument: vscode.TextDocument, filePath: string): vscode.TextDocument {
        return WorkspaceContext.getDocumentByPath(ResourceProvider.pathSearcher(thisDocument, filePath));
    }

    public static pathSearcher(thisDocument: vscode.TextDocument, filePath: string): string {
        let thisFolderPath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
        while (/^\.\.\.?\//.test(filePath)) {
            filePath = filePath.replace(/^\.\.\.?\//, "");
            thisFolderPath = thisFolderPath.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+(\/|\\)$/, "");
        }
        return thisFolderPath + filePath;
    }

    public static documentsToNames(documents: vscode.TextDocument[]): string[] {
        let converted: string[] = [];
        for (let i = 0; i < documents.length; i++) {
            converted[i] = Util.extractFileNameWithNoExtension(documents[i].fileName);
        }
        return converted;
    }

    public static vscodeDocumentsToNames(documents: vscode.TextDocument[]): string[] {
        let converted: string[] = [];
        for (let i = 0; i < documents.length; i++) {
            converted[i] = documents[i].fileName.match(/(([!"#%&'*+,.:<=>@_`~-]*|\w+)+)\.?\w*$/)[0].replace(/\.\w+$/, "");
        }
        return converted;
    }

    public static resourceFormatter(thisDocument: vscode.TextDocument, start: string, path: string): string {
        let filePath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
        let temp = Util.sameCharRemover(filePath, path);
        let format: string;
        while (/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/.test(temp[0])) {
            temp[0] = temp[0].replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/, "");
            temp[1] = "../" + temp[1];
        }
        return (start + temp[1]).replace(/\\/gi, "/");
    }

    public static resourcesFormatter(thisDocument: vscode.TextDocument, start: string, path: string[]): string[] {
        let resourcesFormat: string[] = [];
        for (let i = 0; i < path.length; i++) {
            resourcesFormat.push(ResourceProvider.resourceFormatter(thisDocument, start, path[i]));
        }
        return resourcesFormat;
    }

    public static autoResourcesFormatter(thisDocument: vscode.TextDocument, path: string[]): string[] {
        let resourcesFormat: string[] = ["Resource"];
        resourcesFormat = resourcesFormat.concat(ResourceProvider.resourcesFormatter(thisDocument, "Resource                  ", path));
        return resourcesFormat;
    }
}