'use strict';

import { extractNameFromPath } from '../Util';
import { Member } from './Member';
import { Location, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { RobotDoc } from './RobotDoc';

/**
 * robot keyword class, its intent is to hold Keyword definition from robot document
 */
export class Keyword extends Member {

    private _arguments: string[] = [];
    private _return: string = "";

    /**
     * Keyword default constructor
     * 
     * @param name keyword name
     * @param location keyword location
     * @param args keyword arguments
     * @param returnValue keyword return value
     */
    public constructor(name: string, location: Location, args: string[], returnValue: string) {
        super(name, location);
        this._arguments = args;
        this._return = returnValue;
    }

    /**
     * keyword's fullname include its file origin
     */
    get fullName(): string {
        let path = this.location.uri.fsPath;
        let resource = extractNameFromPath(path);
        return resource + "." + this.name;
    }

    /**
     * keyword's arguments
     */
    get args(): string[] {
        return this._arguments;
    }

    /**
     * keyword's return value
     */
    get returnValue(): string {
        return this._return;
    }

    /**
     * all keyword's references in Array of Member
     */
    get allReferences(): Member[] {
        let result: Member[] = [this];
        let doc = WorkspaceContext.getDocumentByUri(this.location.uri);
        let thisDoc = RobotDoc.parseDocument(doc);
        let workspace = WorkspaceContext.getAllDocuments();
        for (let i = 0; i < workspace.length; i++) {
            let workDoc = RobotDoc.parseDocument(workspace[i]);
            let workDocRes = workDoc.allResources;
            let check = false;
            for (let j = 0; j < workDocRes.length; j++) {
                let res = workDocRes[j];
                if (res.isEqual(thisDoc)) {
                    check = true;
                    break;
                }
            }
            if (check) {
                for (let j = 0; j < workspace[i].lineCount; j++) {
                    let line = workspace[i].lineAt(j).text;
                    if (/^\s{2,}/.test(line)) {
                        let found = line.indexOf(this.name);
                        while (found >= 0) {
                            let start = new Position(j, found);
                            let end = new Position(j, found + this.name.length);
                            let range = new Range(start, end);
                            let loc = new Location(workspace[i].uri, range);
                            let member = new Member(this.name, loc);
                            result.push(member);
                            found = line.indexOf(this.name, end.character);
                        }
                    }
                }
            }
        }
        return result;
    }
}