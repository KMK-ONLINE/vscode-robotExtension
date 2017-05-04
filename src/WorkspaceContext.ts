'use strict'

import { isNullOrUndefined } from 'util';
import { RobotDoc } from './model/RobotDoc';
import { workspace, TextDocument, Uri } from 'vscode';
import fs = require('fs');

/**
 * Context of workspace which will hold all of the workspace robot files
 */
export class WorkspaceContext {

    private static allRobotDoc: RobotDoc[];
    private static allPath: string[] = [];
    private static asyncReadingCounter: number = 0;
    private static configFile: TextDocument;

    /**
     * Function to get config included in the workspace
     */
    public static getConfig() {
        if(isNullOrUndefined(WorkspaceContext.configFile)){
            return null;
        }
        return JSON.parse(WorkspaceContext.configFile.getText());
    }

    /**
     * Function to get number of robot document in the workspace
     */
    public static size(): number {
        return WorkspaceContext.allRobotDoc.length;
    }

    /**
     * Function to get all of the robot TextDocument object in the workspace
     */
    public static getAllDocuments(): RobotDoc[] {
        return WorkspaceContext.allRobotDoc;
    }

    /**
     * Function to get all robot path in the workspace
     */
    public static getAllPath(): string[] {
        return WorkspaceContext.allPath;
    }

    /**
     * Function to get workspace robot TextDocument object by its path
     * 
     * @param path string of path
     * 
     * @return TextDocument object, it will return null if not found
     */
    public static getDocumentByPath(path: string): RobotDoc {
        path = path.replace(/(\\|\/)/g, "/");
        for (let i = 0; i < WorkspaceContext.allRobotDoc.length; i++) {
            let docPath = WorkspaceContext.allRobotDoc[i].document.fileName.replace(/(\\|\/)/g, "/");
            if (docPath == path) {
                return WorkspaceContext.allRobotDoc[i];
            }
        }
        return null;
    }

    /**
     * Function to get workspace robot TextDocument object by its uri
     * 
     * @param uri Uri object
     * 
     * @return TextDocument object, it will return null if not found
     */
    public static getDocumentByUri(uri: Uri): RobotDoc {
        for (let i = 0; i < WorkspaceContext.allRobotDoc.length; i++) {
            let docPath = WorkspaceContext.allRobotDoc[i].document.uri.fsPath;
            if (docPath == uri.fsPath) {
                return WorkspaceContext.allRobotDoc[i];
            }
        }
        return null;
    }

    /**
     * Procedure to scan workspace and search all its robot document and put it in this context
     */
    public static scanWorkspace() {
        if (WorkspaceContext.asyncReadingCounter == 0) {
            WorkspaceContext.asyncReadingCounter = 1;
            console.log("scanning all .robot and .txt path");
            WorkspaceContext.allPath = WorkspaceContext.getAllDirAndDocPath([workspace.rootPath]);
            let docTemp: TextDocument[] = [];
            let temp: RobotDoc[] = [];
            WorkspaceContext.asyncReadingCounter += WorkspaceContext.allPath.length;
            for (let i = 0; i < WorkspaceContext.allPath.length; i++) {
                let opener = workspace.openTextDocument(
                    Uri.file(WorkspaceContext.allPath[i])).then((document) => {
                        docTemp.push(document);
                        WorkspaceContext.asyncReadingCounter--;
                        if (WorkspaceContext.asyncReadingCounter == 1) {
                            WorkspaceContext.finalScan(docTemp, temp);
                        }
                    }, (reason) => {
                        console.log(reason);
                        WorkspaceContext.asyncReadingCounter--;
                        if (WorkspaceContext.asyncReadingCounter == 1) {
                            WorkspaceContext.finalScan(docTemp, temp);
                        }
                    });
            }
        }
    }

    private static finalScan(docs: TextDocument[], robotDocs: RobotDoc[]) {
        for (let i = 0; i < docs.length; i++) {
            let doc = docs[i];
            if (!(isNullOrUndefined(doc))) {
                robotDocs.push(RobotDoc.parseDocument(doc));
            }
        }
        WorkspaceContext.allRobotDoc = robotDocs;
        for (let i = 0; i < WorkspaceContext.allRobotDoc.length; i++) {
            let doc = WorkspaceContext.allRobotDoc[i];
            doc.searchResources();
        }
        for (let i = 0; i < WorkspaceContext.allRobotDoc.length; i++) {
            let doc = WorkspaceContext.allRobotDoc[i];
            doc.scanAllResources();
            doc.assignGlobalVariables();
            doc.scanAllString();
        }
        console.log(
            "finished scanning " + WorkspaceContext.allRobotDoc.length + " robot and txt document"
        );
        WorkspaceContext.asyncReadingCounter = 0;
    }

    /**
     * Function to get all directory and document path from the given paths
     * 
     * @param paths 
     * 
     * @return all path found, it will return empty array if the directory is empty
     */
    public static getAllDirAndDocPath(paths: string[]): string[] {
        let allFiles: string[] = [];
        for (let i = 0; i < paths.length; i++) {
            if (fs.lstatSync(paths[i]).isDirectory()) {
                let directory = fs.readdirSync(paths[i] + "\/");
                for (let j = 0; j < directory.length; j++) {
                    directory[j] = paths[i] + "\/" + directory[j];
                }
                allFiles = allFiles.concat(WorkspaceContext.getAllDirAndDocPath(directory))
            }
            else if (fs.lstatSync(paths[i]).isFile()) {
                if (/(\.robot|\.txt)$/.test(paths[i]) && !(/^\./.test(paths[i]))) {
                    allFiles.push(paths[i]);
                }
                else if (this.configFile == null && /config\.json$/.test(paths[i]) && !(/^\./.test(paths[i]))) {
                    let opener = workspace.openTextDocument(Uri.file(paths[i])).then(
                        (document) => {
                            this.configFile = document;
                        }
                    );
                }
            }
        }
        return allFiles;
    }

}
