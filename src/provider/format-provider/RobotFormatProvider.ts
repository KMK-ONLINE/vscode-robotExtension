'use strict'
import { WorkspaceContext } from '../../WorkspaceContext';
import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, DocumentFormattingEditProvider, Range, Location, WorkspaceEdit } from 'vscode';

export class RobotFormatProvider implements DocumentFormattingEditProvider{

    public provideDocumentFormattingEdits(document: TextDocument):Thenable<WorkspaceEdit>|WorkspaceEdit{
        
        return;
    }

    private getAllLineLocation(document:TextDocument):Location[]{
        let locations:Location[] = [];
        for(let i = 0; i < document.lineCount; i++){
            let range = document.lineAt(i).range;
            locations.push(new Location(document.uri, range))
        }
        return locations;
    }

    private getFormattedLines(document:TextDocument):string[]{
        let formatted:string[][] = [];
        let formatCode:number[] = [];
        for(let i = 0; i < document.lineCount; i++){
            let line = document.lineAt(i).text;
            if(/^\S+/.test(line)){
                if(line.replace(/\s+$/, "").split(/\S{2,}/).length > 1){
                    formatCode.push(0);
                }
                else{
                    formatCode.push(1);
                }
            }
            else{
                formatCode.push(2);
            }
        }
    }

}