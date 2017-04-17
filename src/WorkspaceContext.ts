import { resolve } from 'dns';
import vscode = require('vscode');
import { Util } from './Util';
import fs = require('fs');

export class WorkspaceContext {

    private static allDoc: vscode.TextDocument[] = [];
    private static allPath: string[] = [];
    private static asyncReadingCounter: number = 0;
    private static temp: vscode.TextDocument[];

    public static getAllDocuments(): vscode.TextDocument[] {
        return WorkspaceContext.allDoc;
    }

    public static getAllPath(): string[] {
        return WorkspaceContext.allPath;
    }

    public static getDocumentByPath(path: string): vscode.TextDocument {
        path = path.replace(/(\\|\/)/g, "/");
        for (let i = 0; i < WorkspaceContext.allDoc.length; i++) {
            let docPath = WorkspaceContext.allDoc[i].fileName.replace(/(\\|\/)/g, "/");
            if (docPath == path) {
                return WorkspaceContext.allDoc[i];
            }
        }
        return null;
    }

    public static getDocumentByUri(uri: vscode.Uri): vscode.TextDocument {
        for (let i = 0; i < WorkspaceContext.allDoc.length; i++) {
            let docPath = WorkspaceContext.allDoc[i].uri.fsPath;
            if (docPath == uri.fsPath) {
                return WorkspaceContext.allDoc[i];
            }
        }
        return null;
    }

    public static scanWorkspace() {
        if (WorkspaceContext.asyncReadingCounter == 0) {
            WorkspaceContext.asyncReadingCounter = 1;
            console.log("scanning all .robot and .txt path");
            WorkspaceContext.allPath = WorkspaceContext.getAllDirAndDocPath([vscode.workspace.rootPath]);
            WorkspaceContext.temp = [];
            WorkspaceContext.asyncReadingCounter += WorkspaceContext.allPath.length;
            for (let i = 0; i < WorkspaceContext.allPath.length; i++) {
                let opener = vscode.workspace.openTextDocument(vscode.Uri.file(WorkspaceContext.allPath[i]));
                opener.then((document) => {
                    WorkspaceContext.temp.push(document);
                    WorkspaceContext.asyncReadingCounter--;
                    if (WorkspaceContext.asyncReadingCounter == 1) {
                        WorkspaceContext.allDoc = WorkspaceContext.temp;
                        console.log("finished scanning " + WorkspaceContext.allDoc.length + " robot and txt document");
                        WorkspaceContext.asyncReadingCounter = 0;
                    }
                }, (reason) => {
                    console.log(reason);
                    WorkspaceContext.asyncReadingCounter--;
                    if (WorkspaceContext.asyncReadingCounter == 1) {
                        WorkspaceContext.allDoc = WorkspaceContext.temp;
                        console.log("finished scanning " + WorkspaceContext.allDoc.length + " robot and txt document");
                        WorkspaceContext.asyncReadingCounter = 0;
                    }
                });
            }
        }
    }

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
