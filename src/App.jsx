import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from "react";

import "./App.css";

function App() {

  // Load saved expenses from localStorage
  const [expenses, setExpenses] = useState(() => {
    try {
      const savedExpenses = localStorage.getItem("myExpenses");
      return savedExpenses ? JSON.parse(savedExpenses) : [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(true);
  const [apiExpenses, setApiExpenses] = useState([]);
  const [error, setError] = useState("");

  // useRef
  const nameInputRef = useRef(null);

  // Save expenses whenever they change
  useEffect(() => {
    localStorage.setItem(
      "myExpenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  // Fetch sample API data
  useEffect(() => {

    const fetchExpenses = async () => {
      try {
        const response = await fetch(
          "https://dummyjson.com/carts/1"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }

        const data = await response.json();
        setApiExpenses(data.products);

      } catch (error) {
        setError(error.message);

      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

  }, []);

  // Add expense
  const addExpense = useCallback(() => {

    if (
      name.trim() === "" ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !date
    ) {
      alert("Please enter valid expense details");
      return;
    }

    const newExpense = {
      id: Date.now(),
      name: name.trim(),
      amount: Number(amount),
      category,
      date
    };

    setExpenses((prev) => [...prev, newExpense]);

    setName("");
    setAmount("");
    setCategory("Food");
    setDate(new Date().toISOString().slice(0, 10));

    nameInputRef.current?.focus();

  }, [name, amount, category, date]);

  // Delete expense
  const deleteExpense = useCallback((id) => {
    setExpenses((prev) =>
      prev.filter((expense) => expense.id !== id)
    );
  }, []);

  // Calculate personal total
  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }, [expenses]);

  // Calculate API sample total
  const apiTotal = useMemo(() => {
    return apiExpenses.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [apiExpenses]);

  return (

    <div className="app">

      <h1>Expense Tracker</h1>
      <p>Manage your daily expenses easily.</p>

      {/* Personal Total */}

      <div className="summary">
        <h2>My Total Expenses</h2>
        <h1>₹{totalExpenses.toFixed(2)}</h1>
      </div>

      {/* Add Expense */}

      <div className="expense-form">

        <h2>Add New Expense</h2>

        <input
          ref={nameInputRef}
          type="text"
          placeholder="Expense Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label>Expense Category</label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Education">Education</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <label>Expense Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={addExpense}>
          Add Expense
        </button>

      </div>

      {/* Personal History */}

      <div className="expense-list">

        <h2>My Expense History</h2>

        {expenses.length === 0 ? (
          <p>No expenses added yet.</p>
        ) : (
          expenses.map((expense) => (

            <div className="expense-item" key={expense.id}>

              <div>
                <strong>{expense.name}</strong>
                <p>Category: {expense.category}</p>
                <p>Date: {expense.date}</p>
              </div>

              <strong>₹{expense.amount.toFixed(2)}</strong>

              <button
                onClick={() => deleteExpense(expense.id)}
              >
                Delete
              </button>

            </div>

          ))
        )}

      </div>

      {/* Sample API Expenses */}

      <div className="expense-list">

        <h2>Sample Expenses from API</h2>

        {loading && <p>Loading sample expenses...</p>}

        {error && <p>API Error: {error}</p>}

        {!loading && !error && (
          <>
            {apiExpenses.map((item) => (

              <div className="expense-item" key={item.id}>

                <div>
                  <strong>{item.title}</strong>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price per item: ₹{item.price}</p>
                </div>

                <strong>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </strong>

              </div>

            ))}

            <div className="summary">
              <h3>Sample API Total</h3>
              <h2>₹{apiTotal.toFixed(2)}</h2>
            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default App;