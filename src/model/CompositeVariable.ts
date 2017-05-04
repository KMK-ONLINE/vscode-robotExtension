'use strict';

import { Variable } from './Variable'
import { RobotDoc } from './RobotDoc';
import { Member } from './Member';
import { Location, TextDocument, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';

/**
 * class represent variable which have composite value
 * STILL IN DEVELOPMENT
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
    public constructor(name: string, subVariable: Variable[], location: Location, isGlobal: boolean) {
        super(name, location, true);
        this.isGlobal = isGlobal;
        this.value = null;
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
     * Method to get sub variable by its name with no dot
     * 
     * @param name name of sub variable
     * 
     * @return Sub Variable
     */
    public getSubVariable(name: string): Variable {
        for (let i = 0; i < this._subVariable.length; i++) {
            let variable = this.subVariable[i];
            if (variable.name == name) {
                return variable;
            }
        }
    }

    get allReferences(): Variable[] {
        //need implementation
        return;
    }
}