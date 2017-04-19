'use strict';

import { Location, TextDocument, Range, Position, TextLine, Uri } from 'vscode';
import { LIB } from './KeywordDictionary';
import { extractFileNameWithNoExtension } from '../Util';
import { WorkspaceContext } from '../WorkspaceContext';
import { allIncludedResources, getResourceByName, getAllResourceRefferences } from './ResourceHelper';

export function getKeywordDefinition(location: Location): string {
    let doc = WorkspaceContext.getDocumentByUri(location.uri);
    let pos = location.range.start.line;
    let line = doc.lineAt(pos).text;
    if (/^([-_]*\w+\s?)+\s*$/.test(line)) {
        let args: string;
        let ret: string;
        let result: string = "";
        for (let i = pos + 1; i < doc.lineCount; i++) {
            let line = doc.lineAt(i).text;
            let isInKeyword = !(/^((([-_]*\w+\s?)+)|\*+)/.test(line));
            if (isInKeyword && i < doc.lineCount - 1) {
                if (!args && /^\s+\[Arguments\]/.test(line)) {
                    args = line.replace(/(^\s+|\s+$)/g, "").replace("[Arguments]", "ARGS:")
                        .replace("${", "").replace("}", "").replace(/\s{2,}/g, " ");
                    args = args.replace(/\s/g, ", ").replace(":,", ":");
                }
                else if (!args && /^\s+\[Return\]/.test(line)) {
                    ret = line.replace(/(^\s+|\s+$)/g, "").replace("[Return]", "RET:")
                        .replace("${", "").replace("}", "").replace(/\s{2,}/g, " ");
                    ret = args.replace(/\s/g, ", ").replace(":,", ":");
                }
            }
            else {
                if (args || ret) {
                    if (!args) args = "ARGS: -";
                    if (!ret) ret = "RET: -";
                    return "[ " + args + " ], [ " + ret + " ]";
                }
                else {
                    return "No Arguments needed and No Return value";
                }
            }
        }
    }
    return null;
}

export function getKeywordOrigin(document: TextDocument, keyword: string): Location {
    let result = null;
    try {
        let resources = allIncludedResources(document);
        resources.push(document);
        let resource: string;
        let position: Range;
        for (let i = 0; i < resources.length; i++) {
            position = getKeywordDeclarationPosition(resources[i], keyword);
            if (position != null) {
                resource = resources[i].fileName;
                break;
            }
        }
        result = new Location(Uri.file(resource), position);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        return result
    }
}

export function getIncludedKeywordOrigin(document: TextDocument, file: string, keyword: string)
    : Location {
    let result;
    try {
        let resource = getResourceByName(file, document);
        let range = getKeywordDeclarationPosition(resource, keyword);
        result = new Location(Uri.file(resource.fileName), range);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        return result
    }
}

export function getAllKeywordReferences(document: TextDocument, keyword: string): Location[] {
    let refference = getAllResourceRefferences(document);
    let keyLength = keyword.length;
    let locations: Location[] = [];
    for (let i = 0; i < refference.length; i++) {
        for (let j = 0; j < refference[i].lineCount; j++) {
            let line = refference[i].lineAt(j).text;
            let match = line.match(/^(([-_]*\w+\s?)+)\s*$/);
            if (match != null) {
                if (match[1].replace(/\s+$/, '') == keyword) {
                    locations.push(
                        new Location(
                            refference[i].uri, new Range(
                                new Position(j, 0), new Position(j, keyLength)
                            )
                        )
                    );
                }
            }
            else {
                let found = line.indexOf(keyword);
                if (found >= 0) {
                    let keys = getKeywordByPosition(refference[i], new Position(j, found))
                    if (keys.length == 1) {
                        let key = keys[0];
                        if (key == keyword) {
                            locations.push(
                                new Location(
                                    refference[i].uri, new Range(
                                        new Position(j, found), new Position(j, found + keyLength)
                                    )
                                )
                            );
                        }
                    }
                    else {
                        let key = keys[1];
                        if (key == keyword) {
                            locations.push(
                                new Location(
                                    refference[i].uri, new Range(
                                        new Position(j, found), new Position(j, found + keyLength)
                                    )
                                )
                            );
                        }
                    }
                }
            }
        }
    }
    return locations;
}

export function getKeywordLibrary(included: TextDocument[]): string[] {
    let allLibs: Set<string> = new Set();
    for (let i = 0; i < included.length; i++) {
        let libs = searchIncludedLibrary(included[i]);
        for (let j = 0; j < libs.length; j++) {
            allLibs.add(libs[j]);
        }
    }
    let arrLibs = Array.from(allLibs);
    let keywords: string[] = [];
    for (let i = 0; i < arrLibs.length; i++) {
        for (let j = 0; j < LIB.length; j++) {
            if (LIB[j].name == arrLibs[i]) {
                keywords = keywords.concat(LIB[j].key);
            }
        }
    }
    return keywords;
}

function searchIncludedLibrary(file: TextDocument): string[] {
    let libs: string[] = [];
    for (let i = 0; i < file.lineCount; i++) {
        let match = file.lineAt(i).text.match(/^Library\s+(\w+)/);
        if (match) {
            libs.push(match[1]);
        }
    }
    return libs;
}

export function getKeywordByPosition(document: TextDocument, position: Position): string[] {
    let line = document.lineAt(position.line).text;
    let whiteSpace: number = 0;
    let index: number = 0;
    if (/^([-_]*\w+\s?)+\s*$/.test(line)) {
        return [line.replace(/\s+$/, '')];
    }
    else {
        for (let i = position.character; i >= 0; i--) {
            if (/\s/.test(line.charAt(i))) {
                whiteSpace++;
                if (whiteSpace == 2) {
                    index = i + 2;
                    break;
                }
            }
            else {
                whiteSpace = 0;
            }
        }
        line = line.substr(index);
        let match1 = line.match(/^(([-_]*\w+)+)\.((\w+\s?)*)/);
        let match2 = line.match(/^((\w+\s?)+)(\s{2,})?$/);
        if (match1) {
            return [match1[1], match1[3].replace(/\s+$/, "")];
        }
        else if (match2) {
            return [match2[1].replace(/\s+$/, "")];
        }
        else {
            return null;
        }
    }
}

export function getResourceKeywordByFileName(resources: TextDocument[], fileName: string): string[] {
    for (let i = 0; i < resources.length; i++) {
        let resName = extractFileNameWithNoExtension(resources[i].fileName);
        if (resName == fileName) {
            return searchKeyword(resources[i]);
        }
    }
    return null;
}

export function getKeywordDeclarationPosition(file: TextDocument, keyword: string): Range {
    for (let i = 0; i < file.lineCount; i++) {
        if (/^([-_]*\w+\s?)+\s*$/.test(file.lineAt(i).text)) {
            let match = file.lineAt(i).text.match(/^(([-_]*\w+\s?)+)\s*$/)
            if (match[1].replace(/\s+$/, "") == keyword) {
                return new Range(new Position(i, 0), new Position(i, keyword.length));
            }
        }
    }
    return null;
}

export function searchAllIncludedKeyword(files: TextDocument[]): string[] {
    let keywords: string[] = [];
    for (let i = 0; i < files.length; i++) {
        let fileKeywords = searchKeyword(files[i]);
        if (fileKeywords.length > 0) {
            let fileAndKeywords = mergeFileAndKeyword(files[i], fileKeywords);
            keywords = keywords.concat(fileAndKeywords);
        }
    }
    return keywords;
}

export function searchKeyword(file: TextDocument): string[] {
    let keywords: string[] = [];
    let isInKeywordRange = false;
    for (let i = 0; i < file.lineCount; i++) {
        let line = file.lineAt(i).text;
        if (!isInKeywordRange) {
            isInKeywordRange = /^\*\*\*+\sKeywords\s\*\*\*/.test(line)
        }
        else {
            if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                isInKeywordRange = false;
            }
            else {
                let match = line.match(/^((\w+\s?)+)$/);
                if (match) {
                    keywords.push(match[1]);
                }
            }

        }
    }
    return keywords;
}

export function mergeFileAndKeyword(file: TextDocument, keywords: string[]): string[] {
    let merges: string[] = [];
    let fileName = extractFileNameWithNoExtension(file.fileName);
    for (let i = 0; i < keywords.length; i++) {
        merges.push(fileName + "." + keywords[i]);
    }
    return merges;
}

