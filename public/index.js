"use strict"

const quiz = document.querySelector('.id-quiz')
const selection = document.querySelector('.selection')
const addbtn = document.querySelector('.add')
const startbtn = document.querySelector('.start-btn')

let selectedGroups = []

quiz.style.display = 'none'
document.querySelector('#blank').selected = true

addbtn.addEventListener('click',(e)=>{
    e.preventDefault()
    let selectedGroup = document.querySelector('select').value;

    if(!selectedGroup || selectedGroups.includes(selectedGroup)){
        return;
    }
    selectedGroups.push(selectedGroup)

    

    document.querySelector('.selected-groups-list').append(createGroupName(selectedGroup))
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
    }
})

function clearGroup(e){
    let elm = e.currentTarget;
    console.log(elm)
    selectedGroups.splice(selectedGroups.indexOf(elm.previousElementSibling.textContent),1)
    elm.parentElement.remove();
}

async function loadQuiz(){

    console.log(JSON.stringify({
        groups : selectedGroups,
        count : 30
    }))

    let res = await fetch('/start',{
        method : 'POST',
        body : JSON.stringify({
            groups : selectedGroups,
            count : 30
        }),
        headers : {
            'Content-Type' : 'application/json'
        }
    })

    if(res.ok){
        let quizjson = await res.json()
        renderQuiz(quizjson)
    }
}

function renderQuiz(quizdata){
    const prebtn = document.querySelector('.previous')
    const nextbtn = document.querySelector('.next')
    const progress = document.querySelector('.progress')
    const image = document.querySelector('img')
    const id = document.querySelector('.unknown-img > p')
    const guessbtn = document.querySelector('.guess-btn')
    const usrinput = document.querySelector('.gg input')
    const rightGuessStatus = document.querySelector('.right-guess')
    const wrongGuessStatus = document.querySelector('.wrong-guess')
    const resultbox = document.querySelector('.resultbox')
    const quizgame = document.querySelector('.quizgame')
    const resultSelectedGroups = document.querySelector('.result-selected-groups')
    const resultTotalSpecimens = document.querySelector('.result-total-specimens')
    const resultIdentifiedSpecimens = document.querySelector('.result-identified-specimens')
    const restartbtn2 = document.querySelector('.restart')
    const specimenNumbers = quizdata.length - 1

    let currentSpecimen = 0
    let right_guess = 0
    let guessed = false
    renderSpecimen()
    selection.style.display = 'none'
    quiz.style.display = 'block'
    resultbox.style.display = 'none'
    rightGuessStatus.style.visibility = 'hidden'
    wrongGuessStatus.style.visibility = 'hidden'

    guessbtn.addEventListener('click',(e)=>{
        if(guessed){
            return;
        }
        let guess = usrinput.value
        
        if (guess.toLowerCase() === id.textContent.toLowerCase()){
            right_guess++
            id.style.visibility = 'visible'
            rightGuessStatus.style.visibility = 'visible'
        } else {
            id.style.visibility = 'visible'
            wrongGuessStatus.style.visibility = 'visible'
        }
        guessed = true
    })

    nextbtn.addEventListener('click',(e)=>{
        if(currentSpecimen == specimenNumbers){
            renderResult()
            return
        }

        currentSpecimen++
        renderSpecimen()
        guessed = false
        rightGuessStatus.style.visibility = 'hidden'
        wrongGuessStatus.style.visibility = 'hidden'
    })
    prebtn.addEventListener('click',(e)=>{
        if(currentSpecimen == 0){
            return
        }
    })

    restartbtn2.addEventListener('click',restartQuiz)

    function renderSpecimen(){
        image.setAttribute('src',`/images/${quizdata[currentSpecimen].src}`)
        id.textContent = quizdata[currentSpecimen].name
        id.style.visibility = 'hidden'
        usrinput.value = ""
    }

    function renderResult(){
        resultTotalSpecimens.textContent = `Total Specimens : ${specimenNumbers+1}`
        resultIdentifiedSpecimens.textContent = `Identified Specimens : ${right_guess}`
        for(let sl of selectedGroups){
            resultSelectedGroups.append(createGroupName(sl, 0))
        }
        resultbox.style.display = 'block'
        quizgame.style.display = 'none'
    }
}

function restartQuiz(e){
    quiz.style.display = 'none'
    selectedGroups = []
    document.querySelector('.selected-groups-list').innerHTML = ''
    document.querySelector('#blank').selected = true
    selection.style.display = 'block'
}

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