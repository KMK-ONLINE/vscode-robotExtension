'use strict';

import { Location, TextDocument, Range, Position, TextLine, Uri } from 'vscode';
import { extractNameFromPath, removeSamePath } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';

export function getAllIncludedLibrary(file:TextDocument): string[]{
    let included = searchAllResources(file).concat(file);
    let allLibs: Set<string> = new Set();
    for (let i = 0; i < included.length; i++) {
        let libs = getIncludedLibrary(included[i]);
        for (let j = 0; j < libs.length; j++) {
            allLibs.add(libs[j]);
        }
    }
    return Array.from(allLibs);
}

export function getIncludedLibrary(file: TextDocument): string[] {
    let libs: string[] = [];
    for (let i = 0; i < file.lineCount; i++) {
        let match = file.lineAt(i).text.match(/^Library\s+(\w+)/);
        if (match) {
            libs.push(match[1]);
        }
    }
    return libs;
}

export function searchMatchingFileName(resources: TextDocument[], fileName: string):TextDocument{
    for (let i = 0; i < resources.length; i++) {
        let resName = extractNameFromPath(resources[i].fileName);
        if (resName == fileName) {
            return resources[i];
        }
    }
    return null;
}

export function getAllResourceRefferences(resource: TextDocument): TextDocument[] {
    let reff: Set<TextDocument> = new Set([resource]);
    let allDocs = WorkspaceContext.getAllDocuments();
    for (let i = 0; i < allDocs.length; i++) {
        if (allDocs[i] != resource) {
            let included = searchAllResources(allDocs[i]);
            for (let j = 0; j < included.length; j++) {
                if (included[j] == resource) {
                    reff.add(allDocs[i]);
                    break;
                }
            }
        }
    }
    return Array.from(reff);
}

export function getDocumentResourceByName(resourceName: string, document: TextDocument): TextDocument {
    let files = searchAllResources(document);
    files.push(document);
    for (let i = 0; i < files.length; i++) {
        if (
            resourceName == extractNameFromPath(
                files[i].fileName
            )
        ) {
            return files[i];
        }
    }
}

export function searchAllResources(document: TextDocument): TextDocument[] {
    let included = searchResources(document);
    let length = included.length;
    for (let i = 0; i < length; i++) {
        let temp = searchResources(included[i])
        if (temp != null) {
            for (let j = 0; j < temp.length; j++) {
                let indirectInclude: TextDocument[];
                included.push(temp[j]);
                indirectInclude = searchResources(temp[j]);
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

export function searchResources(document: TextDocument): TextDocument[] {
    let fileLength = document.lineCount;
    let resources: TextDocument[] = [];
    for (let i = 0; i < fileLength; i++) {
        let line = document.lineAt(i).text;
        let matches = line.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
        if (matches) {
            let docs = searchOriginDocumentByRelativePath(document, matches[1]);
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

export function searchOriginDocumentByRelativePath(thisDocument: TextDocument, filePath: string)
    : TextDocument {
    return WorkspaceContext.getDocumentByPath(
        searchOriginByRelativePath(thisDocument, filePath)
    );
}

export function searchOriginByRelativePath(thisDocument: TextDocument, filePath: string): string {
    let thisFolderPath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.?\w*$/, "");
    while (/^\.\.\.?\//.test(filePath)) {
        filePath = filePath.replace(/^\.\.\.?\//, "");
        thisFolderPath = thisFolderPath.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+(\/|\\)$/, "");
    }
    return thisFolderPath + filePath;
}

export function documentsToNames(documents: TextDocument[]): string[] {
    let converted: string[] = [];
    for (let i = 0; i < documents.length; i++) {
        converted[i] = extractNameFromPath(documents[i].fileName);
    }
    return converted;
}

export function formatResource(thisDocument: TextDocument, start: string, path: string)
    : string {
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

export function formatResources(thisDocument: TextDocument, start: string, path: string[])
    : string[] {
    let resourcesFormat: string[] = [];
    for (let i = 0; i < path.length; i++) {
        resourcesFormat.push(formatResource(thisDocument, start, path[i]));
    }
    return resourcesFormat;
}

export function formatFullResources(thisDocument: TextDocument, path: string[]): string[] {
    let resourcesFormat: string[] = [];
    resourcesFormat = resourcesFormat.concat(
        formatResources(thisDocument, "Resource                  ", path)
    );
    return resourcesFormat;
}