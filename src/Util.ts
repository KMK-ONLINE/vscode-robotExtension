import { CompletionItem, CompletionItemKind } from 'vscode';

export function extractFileName(path: string): string {
    return path.match(/([!"#%&'*+,.:<=>@\_`~-]*|\w+)+\.?\w*$/)[0];
}

export function extractNameFromPath(path: string): string {
    return extractFileName(path).replace(/\.\w+$/, "");
}

export function removeSamePath(a: string, b: string): string[] {
    let size = 0;
    for (let i = 0; i < b.length; i++) {
        if (i == a.length) {
            i = b.length;
        }
        else if (a.charAt(i) == b.charAt(i)) {
            size++;
        }
        else {
            i = b.length;
        }
    }
    let result = [a.substr(size), b.substr(size)];
    return result;
}

export function stringArrayToCompletionItems(suggestions: string[], type: CompletionItemKind)
    : CompletionItem[] {
    let items: CompletionItem[] = [];
    suggestions = Array.from(new Set(suggestions));
    for (let i = 0; i < suggestions.length; i++) {
        items.push(new CompletionItem(suggestions[i], type));
    }
    return items;
}

export function subArrayOfString(list: string[], start: number) {
    let result: string[] = [];
    for (let i = 0; i < list.length; i++) {
        let str = list[i].substr(start);
        result.push(str);
    }
    return result;
}