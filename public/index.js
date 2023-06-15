"use strict"

const quiz = document.querySelector('.id-quiz')
const selection = document.querySelector('.selection')
const addbtn = document.querySelector('.add')
const plusCount = document.querySelector('#plus-count')
const minusCount = document.querySelector('#minus-count')
const startbtn = document.querySelector('.start-btn')
let count = 15
let selectedGroups = []

quiz.style.display = 'none'
document.querySelector('#blank').selected = true


addbtn.addEventListener('click', (e)=>{
    e.preventDefault()
    let selectedGroup = document.querySelector('select').value;

    if(!selectedGroup || selectedGroups.includes(selectedGroup)){
        return;
    }
    selectedGroups.push(selectedGroup)
    document.querySelector('.selected-groups-list').append(createGroupName(selectedGroup))
})

plusCount.addEventListener('click',(e)=>{
    if(count==50){
        return
    }
    count++;
    document.querySelector('.count p').textContent = count;

})

minusCount.addEventListener('click',(e)=>{
    if(count==1){
        return
    }
    count--;
    document.querySelector('.count p').textContent = count;

})

startbtn.addEventListener('click',async (e)=>{
    if(!selectedGroups[0]){
        return
    }

    let res = await fetch('/quizinfo')
    if(res.ok){
        let quizhtml = await res.text();
        quiz.innerHTML = quizhtml;
        loadQuiz()
    } else{
        alert('error ocurred, number of specimens not found')
    }
})




function createGroupName(selectedGroup, re = 1){
    let elm = document.createElement('li')
    let p = document.createElement('p')
    
    p.textContent = selectedGroup
    elm.append(p)

    if(re){
        let span = document.createElement('span')
        let i = document.createElement('i')
        i.className = 'fa-solid fa-xmark'
        span.className = 'clear'
        span.append(i)
        span.addEventListener('click',clearGroup)
        elm.append(span)
    }

    return elm
}

function clearGroup(e){
    let elm = e.currentTarget;
    selectedGroups.splice(selectedGroups.indexOf(elm.previousElementSibling.textContent),1)
    elm.parentElement.remove();
}

async function loadQuiz(){
    try{
        let res = await fetch('/start',{
            method : 'POST',
            body : JSON.stringify({
                groups : selectedGroups,
                count : count
            }),
            headers : {
                'Content-Type' : 'application/json'
            }
        })

        if(res.ok){
            let quizjson = await res.json()
            console.log(quizjson)
            renderQuiz(quizjson)
        }
    }catch(er){
        console.log('error occured during fetching json')
    }
}

function restartQuiz(e){
    quiz.style.display = 'none'
    selectedGroups = []
    document.querySelector('.selected-groups-list').innerHTML = ''
    document.querySelector('#blank').selected = true
    selection.style.display = 'block'
}


function renderQuiz(quizdata){
    const nextbtn = document.querySelector('.next')
    const progress = document.querySelector('.progress')
    const image = document.querySelector('img')
    const id = document.querySelector('.unknown-img > p')
    const guessbtn = document.querySelector('.guess-btn')
    const usrinput = document.querySelector('.gg input')
    const rightGuessStatus = document.querySelector('.right-guess')
    const wrongGuessStatus = document.querySelector('.wrong-guess')
    const resultBox = document.querySelector('.resultbox')
    const quizGameBox = document.querySelector('.quizgame')
    const resultSelectedGroups = document.querySelector('.result-selected-groups')
    const resultTotalSpecimens = document.querySelector('.result-total-specimens .num')
    const resultIdentifiedSpecimens = document.querySelector('.result-identified-specimens .num')
    const restartbtn2 = document.querySelector('.restart')
    const specimenNumbers = quizdata.length - 1

    let currentSpecimen = 0
    let right_guess = 0
    let guessed = false

    function renderSpecimen(){
        image.setAttribute('src',quizdata[currentSpecimen].src)
        image.addEventListener('load',renderSpecimenInfo)
    }

    function renderSpecimenInfo(e){
        id.textContent = quizdata[currentSpecimen].name.toUpperCase()
        id.style.visibility = 'hidden'
        usrinput.value = ""
        progress.textContent = `${currentSpecimen+1} - ${specimenNumbers+1}`
        guessed = false
        rightGuessStatus.style.visibility = 'hidden'
        wrongGuessStatus.style.visibility = 'hidden'
        usrinput.className = ''
    }

    function renderResult(){
        resultTotalSpecimens.textContent = `${specimenNumbers+1}`
        resultIdentifiedSpecimens.textContent = `${right_guess}`
        for(let sl of selectedGroups){
            resultSelectedGroups.append(createGroupName(sl, 0))
        }
        resultBox.style.display = 'block'
        quizGameBox.style.display = 'none'
    }

    renderSpecimen()
    
    selection.style.display = 'none'
    quiz.style.display = 'block'
    resultBox.style.display = 'none'
    rightGuessStatus.style.visibility = 'hidden'
    wrongGuessStatus.style.visibility = 'hidden'
    progress.textContent = `${currentSpecimen+1} - ${specimenNumbers+1}`

    guessbtn.addEventListener('click',(e)=>{
        if(guessed){
            return;
        }
        let guess = usrinput.value
        
        if (guess.replaceAll(' ','').replaceAll('-','').toLowerCase() === id.textContent.replaceAll(' ','').replaceAll('-','').toLowerCase()){
            right_guess++
            id.style.visibility = 'visible'
            usrinput.classList.add('right-guess')
            rightGuessStatus.style.visibility = 'visible'
        } else {
            id.style.visibility = 'visible'
            usrinput.classList.add('wrong-guess')
            wrongGuessStatus.style.visibility = 'visible'
        }
        guessed = true
    })

    usrinput.addEventListener('keydown',(e)=>{
        if(e.key == "Enter"){
            guessbtn.click()
        }
    })

    nextbtn.addEventListener('click', (e)=>{
        if(!(usrinput.classList.contains('right-guess') || usrinput.classList.contains('wrong-guess'))){
            return;
        }
        if(currentSpecimen == specimenNumbers){
            renderResult()
            return
        }

        currentSpecimen++
        renderSpecimen()
    })

    restartbtn2.addEventListener('click',restartQuiz)

    
}

