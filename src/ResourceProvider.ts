'use strict';

import vscode = require('vscode');
import fs = require('fs');
import {File} from './File';
import {Util} from './Util';

export class ResourceProvider{
    
    public static allNearestResources(document:vscode.TextDocument):File[]{
        let allFilesPath = ResourceProvider.allNearestResourcesPath(document);
        let allFiles:File[] = [];
        for(let i = 0; i < allFiles.length; i++){
            allFiles.push(new File(allFilesPath[i]));
        }
        return allFiles;
    }


    public static allNearestResourcesPath(document:vscode.TextDocument):string[]{
        let folder = document.fileName.replace(/(\/|\\)([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
        if(folder != vscode.workspace.rootPath + "\\"){
            folder = folder.replace(/(\/|\\)([!"#%&'*+,.:<=>@_`~-]*|\w+)+$/, "");
        }
        let allFiles = ResourceProvider.getAllFiles([folder]);
        return allFiles;
    }

    public static getAllFiles(paths:string[]):string[]{
        let allFiles:string[] = [];
        for(let i = 0; i < paths.length; i++){
            if(fs.lstatSync(paths[i]).isDirectory()){
                let directory = fs.readdirSync(paths[i] + "\\");
                for(let j = 0; j < directory.length; j++){
                    directory[j] = paths[i] + "\\" + directory[j];
                }
                allFiles = allFiles.concat(ResourceProvider.getAllFiles(directory))
            }
            else if(fs.lstatSync(paths[i]).isFile()){
                if(/(\.robot|\.txt)$/.test(paths[i])){
                    allFiles.push(paths[i]);
                }
            }
        }
        return allFiles;
    }

    public static allIncludedResources(document: vscode.TextDocument):File[]{
        let included = ResourceProvider.vscodeResourceSearcher(document);
        let indirectInclude:File[] = [];
        let temp:File[][] = [];
        let length = included.length;
        for(let i = 0; i<length; i++){
            temp.push(ResourceProvider.resourceSearcher(included[i]));
            if(temp[i]!= null){
                for(let j = 0; j < temp[i].length; j++){
                    included.push(temp[i][j]);
                }
            }
        }
        return included;
    }

    public static vscodeResourceSearcher(document:vscode.TextDocument):File[]{
        return ResourceProvider.resourceSearcher(new File(document.fileName));
    }

    public static resourceSearcher(document: File):File[]{
		let fileLength = document.lineCount;
		let resources:File[] = [];
		for(let i = 0; i < fileLength; i++){
			let line = document.lineAt(i);
			let matches = line.match(/^Resource\s+(\S+\.(robot|txt))\s*$/);
			if(matches){
                let docs = ResourceProvider.documentSearcher(document, matches[1]);
                resources.push(docs);
			}
        }
		return resources;
	}

    public static searchFileByName(files:File[], fileName:string):File{
        for(let i = 0; i < files.length; i++){
            if(files[i].fileName == fileName){
                return files[i];
            }
        }
        return null;
    }

    public static documentSearcher(thisDocument:File, filePath:string):File{
        return new File(ResourceProvider.pathSearcher(thisDocument, filePath));
    }

    public static pathSearcher(thisDocument:File, filePath:string):string{
        let thisFolderPath = thisDocument.path.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
        while(/^\.\.\.?\//.test(filePath)){
            filePath = filePath.replace(/^\.\.\.?\//, "");
            thisFolderPath = thisFolderPath.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+(\/|\\)$/, "");
        }
        return thisFolderPath + filePath;
    }

    public static documentsToNames(documents:File[]):string[]{
        let converted:string[] = [];
        for(let i = 0; i < documents.length; i++){
            converted[i] = documents[i].fileNameWithNoExtension;
        }
        return converted;
    }

    public static vscodeDocumentsToNames(documents:File[]):string[]{
        let converted:string[]= [];
        for(let i = 0; i < documents.length; i++){
            converted[i] = documents[i].fileName.match(/(([!"#%&'*+,.:<=>@_`~-]*|\w+)+)\.?\w*$/)[0].replace(/\.\w+$/, "");
        }
        return converted;
    }

    public static resourceFormatter(thisDocument:vscode.TextDocument, start:string, path:string):string{
        let filePath = thisDocument.fileName.replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+\.\w+$/, "");
        let temp = Util.sameCharRemover(filePath, path);
        let format:string;
        while(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/.test(temp[0])){
            temp[0] = temp[0].replace(/([!"#%&'*+,.:<=>@_`~-]*|\w+)+[\\\/]$/, "");
            temp[1] = "../" + temp[1];
        }
        return (start + temp[1]).replace(/\\/gi, "/");
    }

    public static resourcesFormatter(thisDocument:vscode.TextDocument, start:string, path:string[]):string[]{
        let resourcesFormat:string[] = [];
        for(let i = 0; i < path.length; i++){
            resourcesFormat.push(ResourceProvider.resourceFormatter(thisDocument, start, path[i]));
        }
        return resourcesFormat;
    }

    public static autoResourcesFormatter(thisDocument:vscode.TextDocument, path:string[]):string[]{
        let resourcesFormat:string[] = ["Resource"];
        resourcesFormat = resourcesFormat.concat(ResourceProvider.resourcesFormatter(thisDocument, "Resource                  ", path));
        return resourcesFormat;
    }
}