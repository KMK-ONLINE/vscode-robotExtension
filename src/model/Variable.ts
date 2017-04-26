'use strict';

import { RobotDoc } from './RobotDoc';
import { Member } from './Member';
import { Location, TextDocument, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';

/**
 * robot variable class, its intent is to hold all type of variable from robot document
 */
export class Variable extends Member {
    private _isGlobal: boolean = false;
    private _value: string;
    private _isOrigin: boolean = false;

    /**
     * Default constructor for variable object
     * 
     * @param name name of variable
     * @param location location of variable
     * @param isOrigin is this variable is the declaration
     */
    public constructor(name: string, location: Location, isOrigin: boolean) {
        super(name, location);
        this._isOrigin = isOrigin;
    }

    /**
     * Function to generate variable from raw object
     * 
     * @param document TextDocument object which the variable exist
     * @param name name of the variabale
     * @param isOrigin is this variable is the declaration
     * @param line line number of the variable
     * @param start start index from the line where the variable consist
     * 
     * @return Variable object
     */
    public static generateVariable(document: TextDocument, name: string, isOrigin: boolean, line: number, start: number)
        : Variable {
        let startPos = new Position(line, start)
        let endPos = new Position(line, start + name.length);
        let range = new Range(startPos, endPos);
        let loc = new Location(document.uri, range);
        return new Variable(name, loc, isOrigin);
    }

    /**
     * Variable value
     */
    get value(): string {
        return this._value;
    }

    /**
     * Variable value
     */
    set value(value: string) {
        this._value = value;
    }

    /**
     * Globality of the variable
     */
    get isGlobal(): boolean {
        return this._isGlobal;
    }

    /**
     * Globality of the variable
     */
    set isGlobal(isGlobal: boolean) {
        this._isGlobal = isGlobal;
    }

    /**
     *  is the variable is the decaration
     */
    get isOrigin(): boolean {
        return this._isOrigin
    }

    /**
     * is the variable is the decaration
     */
    set isOrigin(isOrigin: boolean) {
        this._isOrigin = isOrigin;
    }

    /**
     * Its variable declaration
     */
    get origin(): Variable {
        if (this.isOrigin) {
            return this;
        }
        else {
            let robotDoc = WorkspaceContext.getDocumentByUri(this.location.uri);
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

    /**
     * Variable references
     */
    get allReferences(): Variable[] {
        if (this.isGlobal) {
            let result: Variable[] = [this];
            let origin = this.origin;
            if (origin != this) {
                result.push(origin);
            }
            let originDoc = WorkspaceContext.getDocumentByUri(origin.location.uri);
            let workspace = WorkspaceContext.getAllDocuments();
            for (let i = 0; i < workspace.length; i++) {
                let workDoc = workspace[i];
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