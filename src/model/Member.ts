'use strict';

import { Location, WorkspaceEdit, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { replace } from '../helper/Editor';

/**
 * Member class which represent all of robot document general components
 */
export class Member {
    private _name: string;
    private _location: Location;

    /**
     * Member default constructor
     * 
     * @param name member name
     * @param location member location
     */
    public constructor(name: string, location: Location) {
        this._name = name;
        this._location = location;
    }

    /**
     * member's name
     */
    get name(): string {
        return this._name;
    }

    /**
     * member's location
     */
    get location() {
        return this._location;
    }

    /**
     * Method to rename this member name
     * @param name new name
     * @param editor WorkspaceEdit object
     * 
     * @return WorkspaceEdit object
     */
    public rename(name: string, editor: WorkspaceEdit): WorkspaceEdit {
        replace(this.location, name, editor);
        let line = this.location.range.start.line;
        let start = this.location.range.start;
        let end = new Position(line, this.location.range.start.character + name.length);
        this._name = name;
        this._location.range = new Range(start, end);
        return editor;
    }

    /**
     * Method to check equality of members object
     * 
     * @param member Member object
     * 
     * @return boolean
     */
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