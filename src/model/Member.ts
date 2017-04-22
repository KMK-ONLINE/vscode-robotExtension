'use strict';

import { Location, WorkspaceEdit, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { replace } from '../helper/Editor';

export class Member {
    private _name: string;
    private _location: Location;

    public constructor(name: string, location: Location) {
        this._name = name;
        this._location = location;
    }

    get name(): string {
        return this._name;
    }

    get location() {
        return this._location;
    }

    public editName(name: string, editor: WorkspaceEdit): WorkspaceEdit {
        replace(this.location, name, editor);
        let line = this.location.range.start.line;
        let start = this.location.range.start;
        let end = new Position(line, this.location.range.start.character + name.length);
        this._name = name;
        this._location.range = new Range(start, end);
        return editor;
    }

    public isEqual(member: Member): boolean {
        if (this._location.uri.fsPath == member.location.uri.fsPath) {
            if (this._location.range.start.line == member.location.range.start.line) {
                if (this._location.range.start.character == member.location.range.start.character) {
                    return this._name == member.name;
                }
            }
        }
        return false;
    }
}