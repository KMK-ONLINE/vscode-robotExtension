'use strict'

import { TextDocument, Position, DocumentFormattingEditProvider, Range, Location, TextEdit, FormattingOptions, CancellationToken } from 'vscode';
import { getEmptyArrayOfString } from '../../Util';
import { documentEditor } from '../../helper/Editor';

export class RobotFormatProvider implements DocumentFormattingEditProvider {

    public provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): Thenable<TextEdit[]> | TextEdit[] {
        let ranges = RobotFormatProvider.getAllLineRange(document);
        let formatted = RobotFormatProvider.getFormattedLines(document);
        return documentEditor(ranges, formatted);
    }

    private static getAllLineRange(document: TextDocument): Range[] {
        let ranges: Range[] = [];
        for (let i = 0; i < document.lineCount; i++) {
            let range = document.lineAt(i).range;
            ranges.push(range);
        }
        return ranges;
    }

    private static getFormattedLines(document: TextDocument): string[] {
        let formatted: string[] = getEmptyArrayOfString(document.lineCount);
        let formatCode: number[] = [];
        let temp: string[] = [];
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i).text;
            temp.push(line.replace(/\s+$/, ""));
            if (/^\S+/.test(line)) {
                if (line.replace(/\s+$/, "").replace(/^\\\s+/, "\\ ").split(/\s{2,}/).length > 1) {
                    formatCode.push(0); //0 for settings component
                }
                else {
                    formatCode.push(2); //2 for keyword, testcase or field initialization
                }
            }
            else if (/^\s*$/.test(line)) {
                formatCode.push(4); //3 for empty line
            }
            else if (/^\s*#/.test(line)) {
                formatCode.push(2);
            }
            else if(/^\s*:/.test(line)){
                formatCode.push(3)
            }
            else {
                formatCode.push(1); //1 for general
            }
        }
        let lengthGuide: number[][] = RobotFormatProvider.getLengthGuide(temp, formatCode);
        for (let i = 0; i < temp.length; i++) {
            let line = temp[i];
            if (formatCode[i] == 0 || formatCode[i] == 1) {
                let sentences: string[];
                let guide = formatCode[i];
                if (formatCode[i] == 1) {
                    formatted[i] = "    ";
                    sentences = line.replace(/^\s+/, "").replace(/^\\\s+/, "\\ ").split(/\s{2,}/);
                }
                else {
                    sentences = line.split(/\s{2,}/);
                }
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j].replace(/\\\s/, "\\    ");
                    while (sentence.length < lengthGuide[guide][j] && j < sentences.length - 1) {
                        sentence = sentence + " ";
                    }
                    formatted[i] = formatted[i] + sentence;
                }
            }
            else if (formatCode[i] == 2) {
                formatted[i] = line;
            }
            else if(formatCode[i] == 3){
                let sentences = line.replace(/^\s+/, "").split(/\s{2,}/);
                formatted[i] = "    ";
                for(let j = 0; j < sentences.length; j++){
                    let sentence = sentences[j];
                    formatted[i] = formatted[i] + sentence
                    if(j < sentences.length - 1){
                        formatted[i] = formatted[i] + "        ";
                    }
                }
            }
        }
        return formatted;
    }

    private static getLengthGuide(lines: string[], formatCode: number[]): number[][] {
        let guides: number[][] = [];
        guides.push([]);
        guides.push([]);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (formatCode[i] == 0 || formatCode[i] == 1) {
                let sentences: string[];
                let code = formatCode[i];
                if (code == 1) {
                    sentences = line.replace(/^\s+/, "").replace(/^\\\s+/, "\\ ").split(/\s{2,}/);
                }
                else {
                    sentences = line.split(/\s{2,}/);
                }
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j].replace(/^\\\s/, "\\    ");
                    if (j == sentences.length - 1 && /^#/.test(sentence)) {
                        break;
                    }
                    if (guides[code].length == j) {
                        guides[code].push(sentence.length + 4);
                    }
                    else if (guides[code][j] < sentence.length + 4) {
                        guides[code][j] = sentence.length + 4;
                    }
                }
            }
        }
        return guides;
    }

}