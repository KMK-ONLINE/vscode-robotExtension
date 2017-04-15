import fs = require('fs');

export class File {
    public text: string[];
    public path: string;

    constructor(path: string) {
        this.read(path);
    }

    public get fileName(): string {
        return this.path.match(/([!"#%&'*+,.:<=>@\_`~-]*|\w+)+\.?\w*$/)[0];
    };

    public get fileNameWithNoExtension(): string {
        return this.fileName.replace(/\.\w+$/, "");
    }

    public get lineCount(): number {
        return this.text.length;
    }

    public lineAt(index: number): string {
        if (index < this.lineCount) {
            return this.text[index];
        }
        else {
            return null;
        }
    }
    public read(path: string) {
        try {
            this.text = fs.readFileSync(path).toString().split("\n");
            this.path = path;
        }
        catch (e) {
            console.log(e);
        }
    }
}
