const screen = document.querySelector('.digit-screen');
const pad = document.querySelector('.pad');
const phone = {screen: screen, pad: pad};
const buttons = Array.from(phone.pad.childNodes).filter(node => {return node.nodeName != '#text'});
const page = document.querySelector('.page');

let floatInserted = false;
let thereIsAFloat = false;
let inputString = '';
let inputArray = [];
let isDone = false;
let remainingString = '';
let gotError = false;
let answer;

buttons.forEach(button => {
    button.addEventListener('click', e => {
        if (/[0-9]/.test(button.innerText)) addNumber(button.innerText);
        else if (button.id == 'btn-clear') cleanScreen();
        else if (/[/X\-+]/.test(button.innerText) && button.id != 'btn-sign') addOperator(button.innerText);
        else if (button.id == 'btn-float') addFloat();
        else if (button.id == 'btn-equal') operate();
        else if (button.id == 'btn-sign') changeSign();
        else if (button.id == 'btn-history') cleanHistory();
    });
});

window.addEventListener('keydown', e => {
    if (/^[0-9]$/.test(e.key)) addNumber(e.key);
    else if (/[/*\-+]/.test(e.key)) addOperator(e.key);
    else if (e.key == 'Backspace' || e.key == 'Delete') cleanScreen();
    else if (e.key == '.') addFloat();
    else if (e.key == '=' || e.key == 'Enter') operate();
});


function addNumber(number) {
    if (gotError) return;

    zoomOut();
    phone.screen.innerText += number;
    inputString += number;
}


function cleanScreen() {
    phone.screen.innerText = '';
    phone.screen.style.zoom = 1;
    inputString = '';
    inputArray = [];
    floatInserted = false;
    gotError = false;
}


function cleanHistory() {
    page.innerHTML = '';
}


function changeSign() {
    if (gotError) return;

    let text = phone.screen.innerText;

    if (/[0-9]+/.test(inputString)) {
        inputString = parseInt(inputString) * -1;
    }

    if (/[\+\-\*\/]/.test(text)) {
        for (let i=0; i<text.length; i++) {
            if (/[^0-9]/.test(text[i])) {
                let index = text.indexOf(text[i]);
                phone.screen.innerText = text.slice(0, index+1);
                phone.screen.innerText += inputString;
            }
        }
    } else {
        phone.screen.innerText = inputString;
    }
}


function addOperator(operator) {
    if (gotError) return;

    let text = phone.screen.innerText;
    const last = text.length-1;

    if (text != '') {2
        if (/[/*\-+]/.test(text[last])) {
            zoomOut();

            operator = (operator == 'X') ? '*' : operator;
            text = text.replace(text[last], operator);
            inputString = operator;
            floatInserted = false;
            phone.screen.innerText = text;
            inputArray[1] = operator;
        } else {
            operator = (operator == 'X') ? '*' : operator;

            if (inputArray.length == 0) {
                phone.screen.innerText += operator;

                if (inputString != '') inputArray.push(inputString);
                else inputArray.push(answer);

                inputArray.push(operator);
            } else {
                operate();
            }
            zoomOut();

            inputString = '';
            floatInserted = false;
        }
    } else {
        if (inputString == '' && answer != undefined) {
            phone.screen.innerText += answer + operator;

            inputArray.push(answer);
            inputArray.push(operator);
        }
    }
}


function addFloat() {
    if (gotError) return;

    let text = phone.screen.innerText;
    const last = text.length-1;
    thereIsAFloat = true;

    if (!floatInserted) {
        if (text == '' || /[/*\-+]/.test(text[last])) {
            phone.screen.innerText += '0.';
            floatInserted = true;
            inputString += '0.';
            zoomOut();
        }
        else {
            phone.screen.innerText += '.';
            floatInserted = true;
            inputString += '.';
            zoomOut();
        }
    }
}


function zoomOut() {
    if (!phone.screen.style.zoom) phone.screen.style.zoom = 1;
    if (phone.screen.innerText.length == 6 || phone.screen.innerText.length == 8 ||
        phone.screen.innerText.length == 10)
        {
            phone.screen.style.zoom -= 0.2;
    }
}


function operate() {
    if (gotError) return;

    if (inputArray.length > 1) {
        inputArray.push(inputString);
        inputString = '';
    }

    const a = inputArray[0];
    const b = inputArray[2];
    const op = inputArray[1];
    
    let result;


    if (!thereIsAFloat && inputArray.length == 3) {
        if (op == '+') result = parseInt(a) + parseInt(b);
        if (op == '-') result = parseInt(a) - parseInt(b);
        if (op == '*') result = parseInt(a) * parseInt(b);
        if (op == '/') result = parseInt(a) / parseInt(b);
    } else if (inputArray.length == 3) {
        if (op == '+') result = parseFloat(a) + parseFloat(b);
        if (op == '-') result = parseFloat(a) - parseFloat(b);
        if (op == '*') result = parseFloat(a) * parseFloat(b);
        if (op == '/') result = parseFloat(a) / parseFloat(b);

        if (!Number.isInteger(result)) result = roundFloating(result, 3);
    }

    if (result == undefined || result == NaN || result == null) {
        result = 'ERROR';
        gotError = true;
    }
    if (result == Infinity || result == -Infinity) {
        result = 'Can not divide by zero.';
        phone.screen.style.zoom = 0.5;
        gotError = true;
    }
    if (inputArray.length == 0 && inputString != '') result = inputString;

    phone.screen.innerText = result;
    page.innerHTML += (gotError) ? '' : `<p>${a}${op}${b}=${result}</p>`;
    answer = (gotError) ? '' : result;
    inputArray = [];
    floatInserted = false;
}


function roundFloating(number, place) {
    let remaining, decimalNumber;

    number = number.toString();
    decimalNumber = number.slice(0, number.indexOf('.')+1);
    remaining = number.slice(number.indexOf('.')+1);

    if (remaining.length > place) {
        remaining = remaining.slice(0, place);
        decimalNumber += remaining;
    }
    decimalNumber = parseFloat(decimalNumber);

    return decimalNumber;
}