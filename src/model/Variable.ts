'use strict';

import { RobotDoc } from './RobotDoc';
import { Member } from './Member';
import { Location, TextDocument, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';

export class Variable extends Member {
    private _isGlobal: boolean = false;
    private _value: string;
    private _isOrigin: boolean = false;

    public constructor(name: string, location: Location, isOrigin: boolean) {
        super(name, location);
        this._isOrigin = isOrigin;
    }

    public static parseVariable(document: TextDocument, name: string, isOrigin: boolean, line: number, start: number)
        : Variable {
        let startPos = new Position(line, start)
        let endPos = new Position(line, start + name.length);
        let range = new Range(startPos, endPos);
        let loc = new Location(document.uri, range);
        return new Variable(name, loc, isOrigin);
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
    }

    get isGlobal(): boolean {
        return this._isGlobal;
    }

    set isGlobal(isGlobal: boolean) {
        this._isGlobal = isGlobal;
    }

    get isOrigin(): boolean {
        return this._isOrigin
    }

    set isOrigin(isOrigin: boolean) {
        this._isOrigin = isOrigin;
    }

    get origin(): Variable {
        if (this.isOrigin) {
            return this;
        }
        else {
            let doc = WorkspaceContext.getDocumentByUri(this.location.uri);
            let robotDoc = RobotDoc.parseDocument(doc);
            let allResources = [robotDoc].concat(robotDoc.allResources);
            for (let i = 0; i < allResources.length; i++) {
                let resource = allResources[i];
                let defines = resource.variableDefinitions;
                for (let j = 0; j < defines.length; j++) {
                    let define = defines[j];
                    if (define.name == this.name) {
                        return define;
                    }
                }
            }
        }
        return null;
    }

    get allRefference(): Variable[] {
        if (this.isGlobal) {
            let result: Variable[] = [this];
            let origin = this.origin;
            if (origin != this) {
                result.push(origin);
            }
            let doc = WorkspaceContext.getDocumentByUri(origin.location.uri);
            let originDoc = RobotDoc.parseDocument(doc);
            let workspace = WorkspaceContext.getAllDocuments();
            for (let i = 0; i < workspace.length; i++) {
                let workDoc = RobotDoc.parseDocument(workspace[i]);
                let workDocRes = workDoc.allResources;
                let check = false;
                for (let j = 0; j < workDocRes.length; j++) {
                    let res = workDocRes[j];
                    if (res.isEqual(originDoc)) {
                        check = true;
                        break;
                    }
                }
                if (check) {
                    let vars = workDoc.usedVariables;
                    for (let j = 0; j < vars.length; j++) {
                        if (vars[j].name == this.name && !(vars[j].isEqual(this))) {
                            result.push(vars[j])
                        }
                    }
                }
            }
            return result;
        }
        return [];
    }
}