'use strict'

import { CompletionItem, CompletionItemKind } from 'vscode';

/**
 * Function to extract file name from the given path, extension of file included
 * 
 * @param path string of path
 * 
 * @return string of file name
 */
export function extractFileNameFromPath(path: string): string {
    return path.match(/[^\\\/]+$/)[0];
}

/**
 * Function to extract file name from the given path, extension of file not included
 * 
 * @param path string of path
 * 
 * @return string of file name
 */
export function extractNameFromPath(path: string): string {
    return extractFileNameFromPath(path).replace(/\.\w+$/, "");
}

/**
 * Function to search same path from two path and remove it
 * 
 * @param a first path
 * @param b second path
 * 
 * @return array of a and b which its same path removed
 */
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

/**
 * Function to format array of string to completion item
 * 
 * @param suggestions array of string
 * @param type CompletionItemKind object
 * 
 * @return array of CompletionItem object
 */
export function stringArrayToCompletionItems(suggestions: string[], type: CompletionItemKind)
    : CompletionItem[] {
    let items: CompletionItem[] = [];
    suggestions = Array.from(new Set(suggestions));
    for (let i = 0; i < suggestions.length; i++) {
        items.push(new CompletionItem(suggestions[i], type));
    }
    return items;
}

/**
 * Function to substr array of string at once
 * 
 * @param list array of string
 * @param start start index of substr
 * 
 * @return array of substr string
 */
export function subArrayOfString(list: string[], start: number): string[] {
    let result: string[] = [];
    for (let i = 0; i < list.length; i++) {
        let str = list[i].substr(start);
        result.push(str);
    }
    return result;
}

/**
 * Function to check is line is documentation or not
 * 
 * @param line 
 * 
 * @return boolean
 */
export function isIgnoreCompletion(line: string){
    return /^\s*\[(Documentation|\d+|Tags)\]/.test(line);
}

/**
 * Function to get empty array of string
 * 
 * @param length length of array
 * 
 * @return empty arrayn of string
 */
export function getEmptyArrayOfString(length: number):string[]{
    let str = new Array(length);
    for(let i = 0; i < length; i++){
        str[i] = "";
    }
    return str;
}

export function multiplyString(base: string, times: number): string {
    let result = '';
    for (let i = 0; i < times; i++) {
        result += base;
    }
    return result;
}