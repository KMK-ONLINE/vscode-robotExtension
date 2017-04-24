'use strict'

import { workspace, TextDocument, Uri } from 'vscode';
import fs = require('fs');

/**
 * Context of workspace which will hold all of the workspace robot files
 */
export class WorkspaceContext {

    private static allDoc: TextDocument[] = [];
    private static allPath: string[] = [];
    private static asyncReadingCounter: number = 0;
    private static temp: TextDocument[];

    /**
     * Function to get number of robot document in the workspace
     */
    public static size(): number {
        return WorkspaceContext.allDoc.length;
    }

    /**
     * Function to get all of the robot TextDocument object in the workspace
     */
    public static getAllDocuments(): TextDocument[] {
        return WorkspaceContext.allDoc;
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
    public static getDocumentByPath(path: string): TextDocument {
        path = path.replace(/(\\|\/)/g, "/");
        for (let i = 0; i < WorkspaceContext.allDoc.length; i++) {
            let docPath = WorkspaceContext.allDoc[i].fileName.replace(/(\\|\/)/g, "/");
            if (docPath == path) {
                return WorkspaceContext.allDoc[i];
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
    public static getDocumentByUri(uri: Uri): TextDocument {
        for (let i = 0; i < WorkspaceContext.allDoc.length; i++) {
            let docPath = WorkspaceContext.allDoc[i].uri.fsPath;
            if (docPath == uri.fsPath) {
                return WorkspaceContext.allDoc[i];
            }
        }
        return null;
    }

    /**
     * Procedure to scan workspace and searh all its robot document and put it in this context
     */
    public static scanWorkspace() {
        if (WorkspaceContext.asyncReadingCounter == 0) {
            WorkspaceContext.asyncReadingCounter = 1;
            console.log("scanning all .robot and .txt path");
            WorkspaceContext.allPath = WorkspaceContext.getAllDirAndDocPath([workspace.rootPath]);
            WorkspaceContext.temp = [];
            WorkspaceContext.asyncReadingCounter += WorkspaceContext.allPath.length;
            for (let i = 0; i < WorkspaceContext.allPath.length; i++) {
                let opener = workspace.openTextDocument(Uri.file(WorkspaceContext.allPath[i]));
                opener.then((document) => {
                    WorkspaceContext.temp.push(document);
                    WorkspaceContext.asyncReadingCounter--;
                    if (WorkspaceContext.asyncReadingCounter == 1) {
                        WorkspaceContext.allDoc = WorkspaceContext.temp;
                        console.log(
                            "finished scanning " + WorkspaceContext.allDoc.length + " robot and txt document"
                        );
                        WorkspaceContext.asyncReadingCounter = 0;
                    }
                }, (reason) => {
                    console.log(reason);
                    WorkspaceContext.asyncReadingCounter--;
                    if (WorkspaceContext.asyncReadingCounter == 1) {
                        WorkspaceContext.allDoc = WorkspaceContext.temp;
                        console.log(
                            "finished scanning " + WorkspaceContext.allDoc.length + " robot and txt document"
                        );
                        WorkspaceContext.asyncReadingCounter = 0;
                    }
                });
            }
        }
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
                if (/(\.robot|\.txt)$/.test(paths[i])) {
                    allFiles.push(paths[i]);
                }
            }
        }
        return allFiles;
    }

}
