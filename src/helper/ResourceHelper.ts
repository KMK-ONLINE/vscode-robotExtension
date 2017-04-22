'use strict';

import { TextDocument } from 'vscode';
import { removeSamePath } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';

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