import { Location, TextDocument, WorkspaceEdit, Position, Range } from 'vscode';
import { WorkspaceContext } from '../WorkspaceContext';
import { Member } from '../model/Member';

export function replace(location: Location, newStr: string, editor: WorkspaceEdit) {
        let uri = location.uri;
        let range = location.range;
        let doc = WorkspaceContext.getDocumentByUri(uri);
        editor.replace(uri, range, newStr);
        return editor;
}

export function replacer(member: Member[], newStr: string) {
        let editor = new WorkspaceEdit();
        for (let i = 0; i < member.length; i++) {
                member[i].editName(newStr, editor);
        }
        return editor;
}