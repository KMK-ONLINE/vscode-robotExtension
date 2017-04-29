'use strict';

import { Variable } from './Variable'
import { RobotDoc } from './RobotDoc';
import { Member } from './Member';
import { Location, TextDocument, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';

/**
 * class represent variable which have composite value
 */
export class CompositeVariable extends Variable {

    private _subVariable: Variable[];

    /**
     * Default constructor for variable object
     * 
     * @param name name of variable
     * @param subVariable sub variable of composite variable
     * @param Location is location of variable
     */
    public constructor(name: string, subVariable: Variable[], location: Location) {
        super(name, location, true);
        this.isGlobal = true;
        this.value = "composite";
        this._subVariable = subVariable;
    }

    /**
     * Sub Variable
     */
    get subVariable(): Variable[] {
        return this._subVariable;
    }

    /**
     * Sub Variable
     */
    set subVariable(variables: Variable[]) {
        this._subVariable = variables;
    }

    /**
     * Sub Variable
     */
    get length(): number {
        return this._subVariable.length;
    }

    /**
     * Method to get sub variable by its name, including dot
     * 
     * @param name name of sub variable, including dot
     * 
     * @return Sub Variable
     */
    public getSubVariable(name: string): Variable {
        for (let i = 0; i < this._subVariable.length; i++) {
            let variable = this.subVariable[i];
            if (this.name + "." + variable.name == name) {
                return variable;
            }
        }
    }

    get allReferences(): Variable[] {
        let result: Variable[] = [this];
        let originDoc = WorkspaceContext.getDocumentByUri(this.location.uri);
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
                    
                }
            }
        }
        return result;

    }

}