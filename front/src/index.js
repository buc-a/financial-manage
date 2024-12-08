const table = document.querySelector('.table');

const formElement = document.forms.add;
const formBtn = document.querySelector('.input__btn');
const selectEl = document.querySelector('#type-select');

const dateInput =  formElement.elements.date;
const summInput = formElement.elements.summ;

const historyTable = document.querySelector('.history');


const card_income = document.querySelector('.card-income');
const card_expenses = document.querySelector('.card-expenses');
const card_budget = document.querySelector('.card-budget');

const summ_income = card_income.querySelector('.card__number');
const summ_expenses = card_expenses.querySelector('.card__number');
const summ_budget = card_budget.querySelector('.card__number');

const history_template = document.querySelector('#history-item');


//заполнение таблицы данными 
function fillTable(templateEl, data){
   
    if ( Array.isArray(data)){
        data.forEach((el) => {
            const history_item = templateEl.content.cloneNode(true);
            const item = history_item.querySelector('.history-item');
            item.querySelector('.history__date').textContent = el.add_date + ':';
            item.querySelector('.history__summ').textContent = el.add_summ + 'p';
            historyTable.prepend(item);
        })
    }
}

function resetForm(){

}
//просмотр истории расходов
card_income.addEventListener('click', () =>{
    historyTable.innerHTML = '';
    historyTable.classList.remove('history-expenses');
    historyTable.classList.add('history-income');

    fetch('/api/history-income/')
    .then((res) => {
        if (res.status !== 200) {return;}
        return res.json();
    })
    .then(data => {
        fillTable(history_template, data);
    })
    .catch(function(err) {  
        console.log('Fetch Error: ', err);  
    });
});


//просмотр истории расходов
card_expenses.addEventListener('click', function(){
    historyTable.innerHTML = '';
    historyTable.classList.add('history-expenses');
    historyTable.classList.remove('history-income');

    fetch('/api/history-expenses/')
    .then((res) => {
        if (res.status !== 200) {return;}
        return res.json();
    })
    .then(data => {
        fillTable(history_template, data);
    })
    .catch(function(err) {  
        console.log('Fetch Error: ', err);  
    });
});

//добавление новой операции
formElement.addEventListener('submit', function(evt) {
    evt.preventDefault();

    const date = dateInput.value;
    const summ = summInput.value;
    const type = selectEl.value;
    
    const dataToSend = {date, summ, type};

    fetch('/api/add/operation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then((res) => {
        if (res.status !== 200) {return;}
        return res.json();
    })
    .catch(function(err) {  
        console.log('Fetch Error: ', err);  
    }).finally(() => {
        formElement.reset();
    })
    

})

//обновляем содержимое полей основных карточек 
fetch('/api/')
    .then((res) => {
        
        if (res.status !== 200) {  
            return;  
        }
        return res.json();

    })
    .then(data => {
        summ_income.textContent = data.income + "p";
        summ_expenses.textContent = data.expenses + "p";
        summ_budget.textContent = data.expenses - data.income + "p";
    })
    .catch(function(err) {  
        console.log('Fetch Error: ', err);  
});
 
