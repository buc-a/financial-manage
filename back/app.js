import express from 'express';
import {mongoose, Schema} from 'mongoose';

const PORT = process.env.PORT || 3003;

const app = express();
app.use(express.json());


const dbURI = 'mongodb://mongo1:27017,mongo2:27017/finance?replicaSet=my-mongo-set';

mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));

const expenseSchema = new Schema({ 
    add_date: { type: String, required: true },
    add_summ: { type: String, required: true },
    current_summ: { type: Number, default: 0 }
 });

const incomeSchema = new Schema({ 
    add_date: { type: String, required: true },
    add_summ: { type: String, required: true },
    current_summ: { type: Number, default: 0 }
});

const Expense = mongoose.model("Expense", expenseSchema);
const Income = mongoose.model("Income", incomeSchema);

//обновляем каждый раз значения в колонках 
app.get("/api/", async (req, res) => {
    console.log("Proccesing request /api/")
    res.status(200).type('json');

    let sumExpenses = 0;
    const lastExpense = await Expense.findOne({}, {}, { sort: { _id: -1 }, limit: 1 }).lean();
    if (lastExpense) {
        sumExpenses = lastExpense.current_summ;
    }

    let sumIncomes = 0;
    const lastIncome = await Income.findOne({}, {}, { sort: { _id: -1 }, limit: 1 }).lean();
    if (lastIncome) {
        sumIncomes = lastIncome.current_summ;
    }    

    let curBalance = sumExpenses - sumIncomes;

    res.status(200).send(
        {
            balance: curBalance,
            expenses: sumExpenses,
            income: sumIncomes
        }
    );
});

app.get("/api/history-expenses/", (req, res) =>{
    console.log("Proccesing request /api/history-expenses/")
    Expense.find({}).lean()
        .then(expenses => {
            res.status(200).json(expenses);
        }   
        )
        .catch(error => {
            res.status(500).json({ error: 'Failed to fetch expences' });
        });

});

app.get("/api/history-income/", (req, res) =>{
    console.log("Proccesing request /api/history-income/")

    Income.find({}).lean()
        .then(incomes => {
            res.status(200).json(incomes);
        }   
        )
        .catch(error => {
            res.status(500).json({ error: 'Failed to fetch incomes' });
        });
});


app.post("/api/add/operation/", async (req, res) => {
    console.log("Proccesing request /api/add/operation/")
    const {date, summ, type} = req.body;

    if (!date || !summ || !type) {
        return res.status(400).json({ error: 'Недостаточно данных' });
    }

    let currSum = parseInt(summ);

    if (type === "expenses"){
        const lastExpense = await Expense.findOne({}, {}, { sort: { _id: -1 }, limit: 1 }).lean();
        if (lastExpense) {
            currSum += parseInt(lastExpense.current_summ);
        }

        const expense = new Expense({
            add_date: date,
            add_summ: summ, 
            current_summ: currSum,
        });
        expense.save()
            .then(()=> {
                res.status(200).json({ message: 'Операция добавлена' });
            })
            .catch(err=> {
                res.status(500).json({ error: 'Ошибка сервера' });              
            })
    }
    else if (type === "income"){
        const lastExpense = await Income.findOne({}, {}, { sort: { _id: -1 }, limit: 1 }).lean();
        if (lastExpense) {
            currSum += parseInt(lastExpense.current_summ);
        }
        const income = new Income({
            add_date: date,
            add_summ: summ, 
            current_summ: currSum,  
        });
        income.save()
            .then(()=> {
                res.status(200).json({ message: 'Операция добавлена' });
            })
            .catch(err=> {
                res.status(500).json({ error: 'Ошибка сервера' });              
            })
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

