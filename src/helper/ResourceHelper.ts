'use strict';

import { Location, TextDocument, Range, Position, TextLine, Uri } from 'vscode';
import { extractFileNameWithNoExtension, removeSamePath } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';

export function getAllResourceRefferences(resource: TextDocument): TextDocument[] {
    let reff: TextDocument[] = [resource];
    let allDocs = WorkspaceContext.getAllDocuments();
    for (let i = 0; i < allDocs.length; i++) {
        if (allDocs[i] != resource) {
            let included = allIncludedResources(allDocs[i]);
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

export function getResourceByName(resourceName: string, document: TextDocument): TextDocument {
    let files = allIncludedResources(document);
    files.push(document);
    for (let i = 0; i < files.length; i++) {
        if (resourceName == extractFileNameWithNoExtension(files[i].fileName)) {
            return files[i];
        }
    }
}

export function allIncludedResources(document: TextDocument): TextDocument[] {
    let included = searchResource(document);
    let length = included.length;
    for (let i = 0; i < length; i++) {
        let temp = searchResource(included[i])
        if (temp != null) {
            for (let j = 0; j < temp.length; j++) {
                let indirectInclude: TextDocument[];
                included.push(temp[j]);
                indirectInclude = searchResource(temp[j]);
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

export function searchResource(document: TextDocument): TextDocument[] {
    let fileLength = document.lineCount;
    let resources: TextDocument[] = [];
    for (let i = 0; i < fileLength; i++) {
        let line = document.lineAt(i).text;
        let matches = line.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
        if (matches) {
            let docs = searchDocumentOrigin(document, matches[1]);
            if (docs != null) {
                resources.push(docs);
            }
        }
    }
    return resources;
}

export function searchFileByName(files: TextDocument[], fileName: string): TextDocument {
    for (let i = 0; i < files.length; i++) {
        if (files[i].fileName == fileName) {
            return files[i];
        }
    }
    return null;
}

export function searchDocumentOrigin(thisDocument: TextDocument, filePath: string): TextDocument {
    return WorkspaceContext.getDocumentByPath(searchPathOrigin(thisDocument, filePath));
}

export function searchPathOrigin(thisDocument: TextDocument, filePath: string): string {
    let thisFolderPath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
    while (/^\.\.\.?\//.test(filePath)) {
        filePath = filePath.replace(/^\.\.\.?\//, "");
        thisFolderPath = thisFolderPath.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+(\/|\\)$/, "");
    }
    return thisFolderPath + filePath;
}

export function documentsToNames(documents: TextDocument[]): string[] {
    let converted: string[] = [];
    for (let i = 0; i < documents.length; i++) {
        converted[i] = extractFileNameWithNoExtension(documents[i].fileName);
    }
    return converted;
}

export function formatResource(thisDocument: TextDocument, start: string, path: string): string {
    let filePath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "").replace(/\\/g, "/");
    path = path.replace(/\\/g, "/");
    let temp = removeSamePath(filePath, path);
    let format: string;
    while (/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/.test(temp[0])) {
        temp[0] = temp[0].replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/, "");
        temp[1] = "../" + temp[1];
    }
    return (start + temp[1]);
}

export function formatResources(thisDocument: TextDocument, start: string, path: string[]): string[] {
    let resourcesFormat: string[] = [];
    for (let i = 0; i < path.length; i++) {
        resourcesFormat.push(formatResource(thisDocument, start, path[i]));
    }
    return resourcesFormat;
}

export function autoFormatResources(thisDocument: TextDocument, path: string[]): string[] {
    let resourcesFormat: string[] = [];
    resourcesFormat = resourcesFormat.concat(formatResources(thisDocument, "Resource                  ", path));
    return resourcesFormat;
}