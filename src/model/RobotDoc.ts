'use strict';

import { searchVariables } from '../helper/VariableHelper';
import { searchKeywords, getDocKeyByPos } from '../helper/KeywordHelper';
import { Keyword } from './Keyword';
import { Variable } from './Variable';
import { TextDocument, Position } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { searchResources } from '../helper/ResourceHelper';
import { LIB } from '../dictionary/KeywordDictionary'

/**
 * RobotDoc class which contains document's keywords, variables and its resources
 */
export class RobotDoc {

    private _keywords: Keyword[];
    private _variables: Variable[];
    private _doc: TextDocument;
    private _resources: TextDocument[];

    private constructor(
        document: TextDocument, keywords: Keyword[], variables: Variable[], resources: TextDocument[]
    ) {
        this._doc = document;
        this._keywords = keywords;
        this._variables = variables;
        this._resources = resources;
    }

    /**
     * Function to parsing TextDocument object into RobotDoc Object
     * 
     * @param document 
     */
    public static parseDocument(document: TextDocument): RobotDoc {
        let variables = searchVariables(document);
        let keywords = searchKeywords(document);
        let resources = searchResources(document);
        let result = new RobotDoc(document, keywords, variables, resources);
        result.assignGlobalVariables();
        return result;
    }

    /**
     * name of the document
     */
    get name() {
        let path = this.document.fileName;
        let nameWithExtension = path.match(/([!"#%&'*+,.:<=>@\_`~-]*|\w+)+\.?\w*$/)[0];
        return nameWithExtension.replace(/\.\w+$/, "");
    }

    /**
     * document's variables
     */
    get variables() {
        return this._variables;
    }

    /**
     * document's variables definition
     */
    get variableDefinitions() {
        let defines: Variable[] = [];
        let variables = this.variables;
        for (let i = 0; i < variables.length; i++) {
            if (variables[i].isOrigin) {
                defines.push(variables[i]);
            }
        }
        return defines;
    }

    /**
     * document's used variables
     */
    get usedVariables() {
        let used: Variable[] = [];
        let variables = this.variables;
        for (let i = 0; i < variables.length; i++) {
            if (!(variables[i].isOrigin)) {
                used.push(variables[i]);
            }
        }
        return used;
    }

    /**
     * all variable names in the document
     */
    get allVariablesName(): string[] {
        let docVarNames: Set<string> = new Set();
        let variables = this.variables;
        for (let i = 0; i < variables.length; i++) {
            docVarNames.add(variables[i].name);
        }
        return Array.from(docVarNames);
    }

    /**
     * all variable names in the document and its resources
     */
    get allIncludedVariablesName(): string[] {
        let varNames: Set<string> = new Set(this.allVariablesName);
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            let variables = resource.variableDefinitions;
            for (let j = 0; j < variables.length; j++) {
                let name = variables[j].name;
                varNames.add(name);
            }
        }
        return Array.from(varNames);
    }

    /**
     * document keywords
     */
    get keywords() {
        return this._keywords;
    }

    /**
     * document keywords name
     */
    get keywordsName() {
        let keywords = this.keywords;
        let result: string[] = [];
        for (let i = 0; i < keywords.length; i++) {
            result.push(keywords[i].name);
        }
        return result;
    }

    /**
     * document and its resources keywords full name with its resource origin
     */
    get allExistKeywordsFullName(): string[] {
        let keyNames: string[] = [];
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            let keywords = resource.keywords;
            for (let j = 0; j < keywords.length; j++) {
                let key = keywords[j]
                let name = key.name;
                let fullName = keywords[j].fullName;
                keyNames.push(name);
                keyNames.push(fullName);
            }
        }
        return keyNames;
    }

    /**
     * document and its resources keywords name
     */
    get allExistKeywordsName(): string[] {
        let keyNames: string[] = [];
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            let keywords = resource.keywords;
            for (let j = 0; j < keywords.length; j++) {
                let name = keywords[j].name;
                keyNames.push(name);
            }
        }
        return keyNames;
    }

    /**
     * document TextDocument object
     */
    get document() {
        return this._doc;
    }

    /**
     * document resources
     */
    get resources() {
        let res: RobotDoc[] = [];
        for (let i = 0; i < this._resources.length; i++) {
            let resource = RobotDoc.parseDocument(this._resources[i]);
            res.push(resource);
        }
        return res;
    }

    /**
     * document resources in TextDocument object form
     */
    get rawResources() {
        return this._resources;
    }

    /**
     * all of document's resources included its direct include
     */
    get allResources() {
        let container: RobotDoc[] = [this];
        container = this.scanResources(container);
        return container;
    }

    /**
     * all of document's resources name included its direct include
     */
    get allResourcesName() {
        let resources = this.allResources;
        let result: string[] = [];
        for (let i = 0; i < resources.length; i++) {
            result.push(resources[i].name);
        }
        return result;
    }

    /**
     * all of document's library included its direct include
     */
    get library(): string[] {
        let libs: string[] = [];
        let resources = this.allResources;
        let added: boolean[] = new Array(LIB.length);
        let addedLength = LIB.length;
        for (let i = 0; i < resources.length && addedLength > 0; i++) {
            let resource = resources[i].document;
            for (let i = 0; i < resource.lineCount; i++) {
                let match = resource.lineAt(i).text.match(/^Library\s+(\w+)/);
                if (match) {
                    for (let j = 0; j < LIB.length; j++) {
                        if (!added[j]) {
                            if (LIB[j].name == match[1]) {
                                libs = libs.concat(LIB[j].key);
                                addedLength--;
                            }
                        }

                    }
                }
            }
        }
        return libs;
    }

    /**
     * Method to get Variable object exist in the document using its position
     * 
     * @param position position of the variable
     * 
     * @return Variable object found, it will retrun null if variable is not found
     */
    public getVariableByPosition(position: Position): Variable {
        for (let i = 0; i < this._variables.length; i++) {
            let variable = this._variables[i];
            if (variable.location.range.contains(position)) {
                return variable;
            }
        }
        return null;
    }

    /**
     * Method to get Keyword object exist in the document using its position
     * 
     * @param position position of the keyword
     * 
     * @return Keyword object found, it will retrun null if keyword is not found
     */
    public getKeywordByPosition(position: Position): Keyword {
        let keyword: string;
        let files: RobotDoc[];
        let keys = getDocKeyByPos(this.document, position);
        if (keys.length == 1) {
            files = this.allResources;
            keyword = keys[0];
        }
        else if (keys.length == 2) {
            let resources = this.allResources;
            for (let i = 0; i < resources.length; i++) {
                let resource = resources[i];
                if (resource.name == keys[0]) {
                    files = [resource];
                    break;
                }
            }
            keyword = keys[1];
        }
        else {
            return null;
        }
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let keywords = file.keywords;
            for (let j = 0; j < keywords.length; j++) {
                let thisKey = keywords[j];
                if (thisKey.name == keyword) {
                    return thisKey;
                }
            }
        }
    }

    /**
     * Method to get Keyword which available in the document's resource by its resource name
     * 
     * @param fileName name of the resource
     * 
     * @return Array of Keyword found. It will return empty array if resource or keyword is not found
     */
    public getKeywordsByName(fileName: string): Keyword[] {
        let resources = this.resources;
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].name == fileName) {
                return resources[i].keywords;
            }
        }
        return [];
    }

    /**
     * Method to get keyword's name which available in the document's resource by its resource name
     * 
     * @param fileName name of the resource
     * 
     * @return Array of keywords name found. it will return empty array if resource or keyword is not found
     */
    public getKeywordsNameByResourceName(fileName: string) {
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].name == fileName) {
                return resources[i].keywordsName;
            }
        }
        return [];
    }

    /**
     * Method to search all Variable object exist in the document by its name
     * 
     * @param name variable name
     * 
     * @return array of Varaible. It will return empy array if variable is not found
     */
    public searchVariables(name: string): Variable[] {
        let result = [];
        let variables = this.variables;
        for (let i = 0; i < variables.length; i++) {
            if (variables[i].name == name) {
                result.push(variables[i]);
            }
        }
        return result;
    }

    /**
     * Method to check is variable exist in the document by its name
     * 
     * @param name name of the variable
     * 
     * @return boolean
     */
    public isVariableExist(name: string): boolean {
        let docVarNames = this.allVariablesName;
        for (let i = 0; i < docVarNames.length; i++) {
            if (docVarNames[i] == name) {
                return true;
            }
        }
        return false;
    }

    /**
     * Metod to check equality of the RobotDoc object
     * 
     * @param doc RobotDoc object
     * 
     * @return boolean
     */
    public isEqual(doc: RobotDoc): boolean {
        return this._doc.uri.fsPath == doc.document.uri.fsPath;
    }

    private assignGlobalVariables() {
        let variables = this.usedVariables;
        let included = this.allResources;
        let defines = this.variableDefinitions;
        for (let i = 0; i < included.length; i++) {
            let resource = included[i];
            if (!(resource.isEqual(this))) {
                let resDefines = resource.variableDefinitions;
                defines = defines.concat(resDefines);
            }
        }
        for (let i = 0; i < variables.length; i++) {
            let variable = variables[i];
            for (let j = 0; j < defines.length; j++) {
                let define = defines[j];
                if (variable.name == define.name) {
                    variable.isGlobal = true;
                    variable.value = define.value;
                    break;
                }
            }
        }
    }

    private scanResources(container: RobotDoc[]): RobotDoc[] {
        let length = container.length;
        if (container.length < WorkspaceContext.size()) {
            let temp = this.rawResources;
            for (let i = 0; i < temp.length; i++) {
                let cLength = container.length;
                let equal = false;
                for (let j = 0; j < cLength; j++) {
                    if (container[j].document == temp[i]) {
                        equal = true;
                    }
                }
                if (!equal) {
                    let robotDoc = RobotDoc.parseDocument(temp[i])
                    container.push(robotDoc);
                    container = robotDoc.scanResources(container);
                }
            }
        }
        return container;
    }
}