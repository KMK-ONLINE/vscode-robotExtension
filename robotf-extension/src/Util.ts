export class Util{

    public static sameCharRemover(a:string, b:string):string[]{
        let size = 0;
        for(let i = 0; i < b.length; i++){
            if(i == a.length){
                i = b.length;
            }
            else if(a.charAt(i) == b.charAt(i)){
                size++;
            }
            else{
                i = b.length;
            }
        }
        let result = [a.substr(size), b.substr(size)];
        return result;
    }
    
}