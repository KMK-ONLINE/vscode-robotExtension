'use strict'

import { Location, TextDocument, WorkspaceEdit, Position, Range, TextLine, TextEdit } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { Member } from '../model/Member';

/**
 * Function to edit range in document with new string using TextEdit Object
 * 
 * @param ranges array of Range which will edited
 * @param newStr array of string which will replace the range
 * 
 * @return array of TextEdit Object
 */
export function documentEditor(ranges: Range[], newStr: string[]): TextEdit[] {
        let editor: TextEdit[] = [];
        for (let i = 0; i < newStr.length; i++) {
                editor.push(new TextEdit(ranges[i], newStr[i]));
        }
        return editor;
}

/**
 * Function to replace location with new string using WorkspaceEdit Object
 * 
 * @param location object Location
 * @param newStr string which will replace the location
 * @param editor WorkspaceEdit object
 * 
 * @return WorkspaceEdit object
 */
export function replace(location: Location, newStr: string, editor: WorkspaceEdit): WorkspaceEdit {
        let uri = location.uri;
        let range = location.range;
        let doc = WorkspaceContext.getDocumentByUri(uri);
        editor.replace(uri, range, newStr);
        return editor;
}

/**
 * Function to rename all of members given
 * 
 * @param member Array of Member object which its name will replaced
 * @param newStr string which will replace the location
 * 
 * @return WorkspaceEdit object
 */
export function replacer(member: Member[], newStr: string): WorkspaceEdit {
        let editor = new WorkspaceEdit();
        for (let i = 0; i < member.length; i++) {
                member[i].rename(newStr, editor);
        }
        return editor;
}