'use strict';

import vscode = require('vscode');
import { Util } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';

export class ResourceHelper {

    public static getAllResourceRefferences(resource: vscode.TextDocument): vscode.TextDocument[] {
        let reff: vscode.TextDocument[] = [resource];
        let allDocs = WorkspaceContext.getAllDocuments();
        for (let i = 0; i < allDocs.length; i++) {
            if (allDocs[i] != resource) {
                let included = ResourceHelper.allIncludedResources(allDocs[i]);
                for (let j = 0; j < included.length; j++) {
                    if (included[j] == resource) {
                        reff.push(allDocs[i]);
                        break;
                    }
                }
            }
        }
        return reff;
    }

    public static getResourceByName(resourceName: string, document: vscode.TextDocument): vscode.TextDocument {
        let files = ResourceHelper.allIncludedResources(document);
        files.push(document);
        for (let i = 0; i < files.length; i++) {
            if (resourceName == Util.extractFileNameWithNoExtension(files[i].fileName)) {
                return files[i];
            }
        }
    }

    public static allIncludedResources(document: vscode.TextDocument): vscode.TextDocument[] {
        let included = ResourceHelper.searchResource(document);
        let length = included.length;
        for (let i = 0; i < length; i++) {
            let temp = ResourceHelper.searchResource(included[i])
            if (temp != null) {
                for (let j = 0; j < temp.length; j++) {
                    let indirectInclude: vscode.TextDocument[];
                    included.push(temp[j]);
                    indirectInclude = ResourceHelper.searchResource(temp[j]);
                    if (indirectInclude != null) {
                        for (let k = 0; k < indirectInclude.length; k++) {
                            included.push(indirectInclude[k]);
                        }
                    }
                }
            }
        }
        return included;
    }

    public static searchResource(document: vscode.TextDocument): vscode.TextDocument[] {
        let fileLength = document.lineCount;
        let resources: vscode.TextDocument[] = [];
        for (let i = 0; i < fileLength; i++) {
            let line = document.lineAt(i).text;
            let matches = line.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
            if (matches) {
                let docs = ResourceHelper.searchDocumentOrigin(document, matches[1]);
                if (docs != null) {
                    resources.push(docs);
                }
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

    public static searchDocumentOrigin(thisDocument: vscode.TextDocument, filePath: string): vscode.TextDocument {
        return WorkspaceContext.getDocumentByPath(ResourceHelper.searchPathOrigin(thisDocument, filePath));
    }

    public static searchPathOrigin(thisDocument: vscode.TextDocument, filePath: string): string {
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

    public static formatResource(thisDocument: vscode.TextDocument, start: string, path: string): string {
        let filePath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
        let temp = Util.removeSamePath(filePath, path);
        let format: string;
        while (/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/.test(temp[0])) {
            temp[0] = temp[0].replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/, "");
            temp[1] = "../" + temp[1];
        }
        return (start + temp[1]).replace(/\\/gi, "/");
    }

    public static formatResources(thisDocument: vscode.TextDocument, start: string, path: string[]): string[] {
        let resourcesFormat: string[] = [];
        for (let i = 0; i < path.length; i++) {
            resourcesFormat.push(ResourceHelper.formatResource(thisDocument, start, path[i]));
        }
        return resourcesFormat;
    }

    public static autoFormatResources(thisDocument: vscode.TextDocument, path: string[]): string[] {
        let resourcesFormat: string[] = ["Resource"];
        resourcesFormat = resourcesFormat.concat(ResourceHelper.formatResources(thisDocument, "Resource                  ", path));
        return resourcesFormat;
    }
}