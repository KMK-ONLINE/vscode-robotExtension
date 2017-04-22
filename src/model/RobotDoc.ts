'use strict';

import { searchVariables } from '../helper/VariableHelper';
import { searchKeywords, getDocKeyByPos } from '../helper/KeywordHelper';
import { Keyword } from './Keyword';
import { Variable } from './Variable';
import { TextDocument, Position } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { searchResources } from '../helper/ResourceHelper';
import { LIB } from '../dictionary/KeywordDictionary'

export class RobotDoc {

    private _keywords: Keyword[];
    private _variables: Variable[];
    private _doc: TextDocument;
    private _resources: TextDocument[];

    private constructor(document: TextDocument, keywords: Keyword[], variables: Variable[], resources: TextDocument[]) {
        this._doc = document;
        this._keywords = keywords;
        this._variables = variables;
        this._resources = resources;
    }

    public static parseDocument(document: TextDocument): RobotDoc {
        let variables = searchVariables(document);
        let keywords = searchKeywords(document);
        let resources = searchResources(document);
        let result = new RobotDoc(document, keywords, variables, resources);
        result.assignGlobalVariables();
        return result;
    }

    public getVariableByPosition(position: Position): Variable {
        for (let i = 0; i < this._variables.length; i++) {
            let variable = this._variables[i];
            if (variable.location.range.contains(position)) {
                return variable;
            }
        }
        return null;
    }

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

    get name() {
        let path = this.document.fileName;
        let nameWithExtension = path.match(/([!"#%&'*+,.:<=>@\_`~-]*|\w+)+\.?\w*$/)[0];
        return nameWithExtension.replace(/\.\w+$/, "");
    }

    get keywords() {
        return this._keywords;
    }

    get keywordNames() {
        let keywords = this.keywords;
        let result: string[] = [];
        for (let i = 0; i < keywords.length; i++) {
            result.push(keywords[i].name);
        }
        return result;
    }

    get document() {
        return this._doc;
    }

    get variables() {
        return this._variables;
    }

    get resources() {
        let res: RobotDoc[] = [];
        for (let i = 0; i < this._resources.length; i++) {
            let resource = RobotDoc.parseDocument(this._resources[i]);
            res.push(resource);
        }
        return res;
    }

    private assignGlobalVariables() {
        let variables = this.usedVariables;
        let included = this.allResources;
        let defines = this.definesVariables;
        for (let i = 0; i < included.length; i++) {
            let resource = included[i];
            if (!(resource.isEqual(this))) {
                let resDefines = resource.definesVariables;
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

    get definesVariables() {
        let defines: Variable[] = [];
        let variables = this.variables;
        for (let i = 0; i < variables.length; i++) {
            if (variables[i].isOrigin) {
                defines.push(variables[i]);
            }
        }
        return defines;
    }

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

    get allAvailableVariableNames(): string[] {
        let varNames: Set<string> = new Set(this.availableVariableNames);
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            let variables = resource.definesVariables;
            for (let j = 0; j < variables.length; j++) {
                let name = variables[j].name;
                varNames.add(name);
            }
        }
        return Array.from(varNames);
    }

    get allAvailableKeywordFullNames(): string[] {
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

    get allAvailableKeywordNames(): string[] {
        let keyNames: string[] = [];
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            let keywords = resource.keywords;
            for (let j = 0; j < keywords.length; j++) {
                let name = keywords[i].name;
                keyNames.push(name);
            }
        }
        return keyNames;
    }

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
                            if (LIB[j].name == match[i]) {
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

    public getKeywordsByName(fileName: string) {
        let resources = this.resources;
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].name == fileName) {
                return resources[i].keywords;
            }
        }
        return [];
    }

    public getKeywordNameByResourceName(fileName: string) {
        let resources = this.allResources;
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].name == fileName) {
                return resources[i].keywordNames;
            }
        }
        return [];
    }

    get availableVariableNames(): string[] {
        let docVarNames: Set<string> = new Set();
        let variables = this.variables;
        for (let i = 0; i < variables.length; i++) {
            docVarNames.add(variables[i].name);
        }
        return Array.from(docVarNames);
    }

    public isVariableExist(name: string): boolean {
        let docVarNames = this.availableVariableNames;
        for (let i = 0; i < docVarNames.length; i++) {
            if (docVarNames[i] == name) {
                return true;
            }
        }
        return false;
    }

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

    get rawResources() {
        return this._resources;
    }

    get allResources() {
        let container: RobotDoc[] = [this];
        container = this.scanResources(container);
        return container;
    }

    get allResourceNames(){
        let resources = this.allResources;
        let result: string[] = [];
        for(let i = 0; i < resources.length; i++){
            result.push(resources[i].name);
        }
        return result;
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

    public isEqual(doc: RobotDoc): boolean {
        return this._doc.uri.fsPath == doc.document.uri.fsPath;
    }
}