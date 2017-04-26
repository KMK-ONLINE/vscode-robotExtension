'use strict';
import { RobotDoc } from '../model/RobotDoc';

import { TextDocument } from 'vscode';
import { removeSamePath } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';

/**
 * Function to search included resources from TextDocument
 * 
 * @param document TextDocument object
 * 
 * @return Array of TextDocument, it will return empty array if resources are not found
 */
export function getDocResources(document: TextDocument): RobotDoc[] {
    let fileLength = document.lineCount;
    let resources: RobotDoc[] = [];
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

/**
 * Function to search TextDocument object by its relative path from one TextDocument
 * 
 * @param thisDocument TextDocument which will be start of the relative path 
 * @param filePath the relative path
 * 
 * @return TextDocument object
 */
export function searchOriginDocumentByRelativePath(thisDocument: TextDocument, filePath: string)
    : RobotDoc {
    return WorkspaceContext.getDocumentByPath(
        searchOriginByRelativePath(thisDocument, filePath)
    );
}

/**
 * Function to search absolute path from relative path from one TextDocument
 * 
 * @param thisDocument TextDocument which will be start of the relative path 
 * @param filePath the relative path
 * 
 * @return absolute path of the relative path 
 */
export function searchOriginByRelativePath(thisDocument: TextDocument, filePath: string): string {
    let thisFolderPath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.?\w*$/, "");
    while (/^\.\.\.?\//.test(filePath)) {
        filePath = filePath.replace(/^\.\.\.?\//, "");
        thisFolderPath = thisFolderPath.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+(\/|\\)$/, "");
    }
    return thisFolderPath + filePath;
}

/**
 * Function to format the resource absolute path into its relative path with first sentences
 * 
 * @param thisDocument TextDocument Object which will include the resource
 * @param start start sentences before the relative path
 * @param path the absolute path of the resource
 * 
 * @return string o formated resource path
 */
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

/**
 * Function to format the resources absolute paths into its relative path with first sentences
 * 
 * @param thisDocument TextDocument Object which will include the resource
 * @param start start sentences before the relative path
 * @param path the absolute paths of the resources
 * 
 * @return string of formated resources path
 */
export function formatResources(thisDocument: TextDocument, start: string, path: string[])
    : string[] {
    let resourcesFormat: string[] = [];
    for (let i = 0; i < path.length; i++) {
        resourcesFormat.push(formatResource(thisDocument, start, path[i]));
    }
    return resourcesFormat;
}

/**
 * Function to format resources absolute paths into relative path with standard robotframework format
 * 
 * @param thisDocument TextDocument Object which will include the resource
 * @param path the abosolute paths of the resources
 * 
 * @return string of formated resources path
 */
export function formatFullResources(thisDocument: TextDocument, path: string[]): string[] {
    let resourcesFormat: string[] = [];
    resourcesFormat = resourcesFormat.concat(
        formatResources(thisDocument, "Resource                  ", path)
    );
    return resourcesFormat;
}