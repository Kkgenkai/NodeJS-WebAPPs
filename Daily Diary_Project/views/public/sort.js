function sort(){
    let parentHolderDiv = $('.container');
    let diaryHolders = $('.diaries');
    let span = Array.from(diaryHolders.find('span'));
    
    let sortedDiaryHolders = [];
    if($("#sortBy :selected").val() === "latest"){
        sortedDiaryHolders = Array.from(span).sort((a,b) =>{
            let first = new Date(a.textContent);
            let second = new Date(b.textContent);
            return second - first;
        });
    }else if($("#sortBy :selected").val() === "oldest"){
        sortedDiaryHolders = Array.from(span).sort((a,b) =>{
            let first = new Date(a.textContent);
            let second = new Date(b.textContent);
            return first - second;
        });
    }

    let sortedDiary = [];
    for (let i=0; i < diaryHolders.length; i++) {
        for(let j=0; j < sortedDiaryHolders.length; j++){
            if(span[j] === sortedDiaryHolders[i]){
                sortedDiary.push(diaryHolders[j]);
            }
        }        
    }
    parentHolderDiv.empty();
    parentHolderDiv.append(sortedDiary);        
}

$(document).ready(()=>{
    sort();
});