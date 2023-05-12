let serverUrl = 'https://localhost:7042/'
let tests; //все тесты, к оторый есть
let test; //тест, который сейчас на экране
let questionBlock; //блок вопроса, который сейчас на экране
let question; //вопрос, который сейччас на экране
let answers = []; //список ответов, на которые ответил пользователь
let questionId; //айди вопроса, который был нажат

let testList = document.querySelector(".test-num-list"); //контейнер, куда добавляются все номеры тестов
let questionsList = document.querySelector(".question-list") //контейнер, куда добавляются все номера вопросов в текущем тесте
let block = document.querySelector(".block") //блок, где находится и картинка и ответы на вопрос, нужен для того, что бы скрыть его в начале
let image = block.querySelector("img") //картинка
let answersList = block.querySelectorAll(".answer") //список блоков с ответами
let questionText = block.querySelector(".question-text") //блок, куда записывается текст
block.style.display = "none" //при загрузке сайта скрываем картинку и ответы


getData(serverUrl + "api/count") //получаем количество тестов, которые есть в базе
    .then((data) => tests = data) //записываем их в переменную для дальнейшего использования
    .then(()=>{
        tests.forEach((test) => { // пробегаемся по всем тестам и добавляем для каждого из них блок, где написан номер этого теста
            testList.innerHTML += `<div class="test-num">${test}</div>`
        })
        testList.innerHTML += `<div class="test-num">exam</div>` //добавляем блок для экзамена
    })
    .then(()=>{
        let testNums = document.querySelectorAll(".test-num") //записываем в переменную все блоки, с номерами тестов
        testNums.forEach((testNum) => { //пробегаемся по каждому и вешаем на него слушатель на клик
            testNum.addEventListener("click", ()=>{
                let testUrl; //переменная для отправки запроса на сервер
                if (testNum.innerText === "exam"){ //если мы нажали на экзамен, то урл такой:
                    testUrl = serverUrl + "api/exam"
                }else{
                    testUrl = serverUrl + "api/test/" + testNum.innerText //если нажали на один из тестов, то урл такой:
                    console.log(testUrl)
                }
                getData(testUrl) //получили тест, на который нажали
                    .then(data => {
                        console.log(data)
                        test = data //записали его в переменную для дальнейшего использования
                        viewTest() //вывели вопросы с этого теста и еще некоторые преобразования...
                    })
            })
        })
    })





function viewTest(){
    questionsList.innerHTML = ""; //скрыли вопросы теста, которые были до этого, делается для того, что бы они не накладывались длуг на друга

    for (let i = 0; i < test.length;i++){//пробегаемся по каждому из вопросов
        questionsList.innerHTML += `<div class="question">${i + 1}</div>`//добавляем блок с номером вопроса текущего теста на страницу
        let questList = document.querySelectorAll(".question") //записываем в переменнуюю все блоки с номерами вопросов для дальнейшего использования
        questList.forEach((quest)=>{ //пробегаемся по каждому  блоку с вопросом
            quest.addEventListener("click", questionClick) //вешаем на него слушатель события клик
        })
    }
}

function questionClick(event){

    block.style.display = "block";
    questionBlock = event.target
    questionId = event.target.innerText - 1
    question = test[questionId]
    image.src = serverUrl + "assets/image/" + question.url
    questionText.innerText = question.question;
    answersList[0].innerText = question.first;
    answersList[1].innerText = question.second;
    answersList[2].innerText = question.third;

    if (test.length === 20){
        for (let i = 0; i < answersList.length; i++){
            answersList[i].addEventListener("click",  examAnswerClick)
        }
    }
    else{
        for (let i = 0; i < answersList.length; i++){
            answersList[i].addEventListener("click",  testAnswerClick)
        }
    }
}

function examAnswerClick(event){
    if(questionBlock.style.backgroundColor === "grey") return;
    console.log(event.target.id)
    console.log(question.answer)
    answers[questionId] = event.target.id == question.answer;

    questionBlock.style.backgroundColor = "grey";
    questionBlock.style.color = "white"

    if (answers.length === test.length){
        if(isWin()) alert("Все верно, поздравляю!!!")
        else alert("Вы провалили тест, попробуйте еще раз")
    }
}

function testAnswerClick(event){
    if(questionBlock.style.backgroundColor === "red" || questionBlock.style.backgroundColor === "green") return;
    console.log(event.target.id)
    console.log(question.answer)
    if (event.target.id == question.answer){
        answers[questionId] = true
        questionBlock.style.backgroundColor = "green";
        questionBlock.style.color = "white"

    }else{
        questionBlock.style.backgroundColor = "red"
        questionBlock.style.color = "white"
        answers[questionId] = false
    }
    if (answers.length === test.length){
        if(isWin()) alert("Все верно, поздравляю!!!")
        else alert("Вы провалили тест, попробуйте еще раз")
    }
}

function isWin(){
    return !answers.includes(false);
}


async function getData(url){
    let response = await fetch(url)
    if(response.ok) return await response.json()
    return Error("Smth was wrong")
}