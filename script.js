let boxes = document.querySelectorAll('.box');
let reset = document.querySelector("#reset");
let winner = document.querySelector(".winner");

let turnO = true; //playerX , playerO

const winPattern = [
    [0,1,2],
    [0,3,6],
    [0,4,8],
    [1,4,7],
    [2,5,8],
    [2,4,6],
    [3,4,5],
    [6,7,8],
];

boxes.forEach((box) =>{
    box.addEventListener("click",() =>{
        // console.log("box clicked...");
        if (turnO) {
             box.innerText = "O"
             turnO = false;
        }else{
            box.innerText = "X";
            turnO = true;
        }
        box.disabled = true

        checkwinner()
    })
})

const checkwinner = () =>{
    for(let pattern of winPattern){
        // console.log(pattern[0],pattern[1],pattern[2])
        // console.log(
        //     boxes[pattern[0]].innerText,
        //     boxes[pattern[1]].innerText,
        //     boxes[pattern[2]].innerText
        // );

        let pos1 =  boxes[pattern[0]].innerText;
        let pos2 = boxes[pattern[1]].innerText;
        let pos3 = boxes[pattern[2]].innerText;

        if(pos1 != "" && pos2 != "" && pos3 != "" ){
            if(pos1 === pos2 && pos2 === pos3){
                console.log("winner")
                console.log("winner is",pos1)
                winner.innerText = "Winner is "+ pos1;
            }
        }
    }
}