import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, DollarSign, TrendingUp, Calculator, 
  Receipt, Wallet, PiggyBank, Plus, Trash2, Printer, Check, ArrowRightLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { playClick, playCoin } from '../../audio/soundEffects';

const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.45,
  CAD: 1.39,
  AUD: 1.53,
  JPY: 154.20,
  CHF: 0.88,
  CNY: 7.23,
  AED: 3.67,
  SGD: 1.34,
  NZD: 1.68
};

export default function FinanceTools() {
  const [activeTab, setActiveTab] = useState('invoice'); 
  // 'invoice' | 'currency' | 'sip' | 'interest' | 'emi' | 'gst' | 'expenses'

  // 1. INVOICE GENERATOR STATE
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [companyName, setCompanyName] = useState('CYBERNETIC SYSTEMS INC.');
  const [clientName, setClientName] = useState('ACME ENTERPRISES');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('$');
  const [items, setItems] = useState([
    { desc: 'Full-Stack Software Architecture', qty: 40, rate: 120 },
    { desc: 'Cybersecurity Threat Audit', qty: 1, rate: 2500 }
  ]);
  const [taxRate, setTaxRate] = useState(10);

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  const addItem = () => {
    setItems([...items, { desc: 'Consulting Services', qty: 1, rate: 100 }]);
    playClick();
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    playClick();
  };

  const exportInvoicePdf = () => {
    playClick();
    const doc = new jsPDF();
    doc.setFont('courier', 'bold');
    doc.setFontSize(18);
    doc.text(companyName, 20, 25);

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.text(`INVOICE: ${invoiceNumber}`, 20, 35);
    doc.text(`DATE: ${invoiceDate}`, 20, 42);
    doc.text(`BILLED TO: ${clientName}`, 20, 50);

    doc.line(20, 56, 190, 56);
    doc.text('DESCRIPTION', 20, 62);
    doc.text('QTY', 120, 62);
    doc.text('RATE', 145, 62);
    doc.text('TOTAL', 170, 62);
    doc.line(20, 66, 190, 66);

    let y = 74;
    items.forEach(item => {
      doc.text(item.desc.slice(0, 45), 20, y);
      doc.text(String(item.qty), 120, y);
      doc.text(`${currency}${item.rate}`, 145, y);
      doc.text(`${currency}${(item.qty * item.rate).toFixed(2)}`, 170, y);
      y += 8;
    });

    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    doc.text(`SUBTOTAL: ${currency}${subtotal.toFixed(2)}`, 130, y);
    y += 6;
    doc.text(`TAX (${taxRate}%): ${currency}${taxAmount.toFixed(2)}`, 130, y);
    y += 8;
    doc.setFont('courier', 'bold');
    doc.text(`GRAND TOTAL: ${currency}${grandTotal.toFixed(2)}`, 130, y);

    doc.save(`${invoiceNumber}.pdf`);
    playCoin();
  };

  // 2. CURRENCY CONVERTER
  const [currAmount, setCurrAmount] = useState(100);
  const [currFrom, setCurrFrom] = useState('USD');
  const [currTo, setCurrTo] = useState('EUR');

  const currConverted = (
    (Number(currAmount) || 0) / (EXCHANGE_RATES[currFrom] || 1) * (EXCHANGE_RATES[currTo] || 1)
  ).toFixed(2);

  const swapCurrencies = () => {
    setCurrFrom(currTo);
    setCurrTo(currFrom);
    playClick();
  };

  // 3. MUTUAL FUNDS / SIP CALCULATOR
  const [sipMonthly, setSipMonthly] = useState(500);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  const sipMonths = sipYears * 12;
  const sipMonthlyRate = sipRate / 12 / 100;
  const sipInvested = sipMonthly * sipMonths;
  const sipTotalValue = Math.round(
    sipMonthly * ((Math.pow(1 + sipMonthlyRate, sipMonths) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate)
  );
  const sipReturns = sipTotalValue - sipInvested;

  // 4. EMI CALCULATOR
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanInterest, setLoanInterest] = useState(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState(15);

  const emiMonths = loanTenureYears * 12;
  const emiMonthlyRate = loanInterest / 12 / 100;
  const monthlyEmi = Math.round(
    (loanAmount * emiMonthlyRate * Math.pow(1 + emiMonthlyRate, emiMonths)) /
    (Math.pow(1 + emiMonthlyRate, emiMonths) - 1)
  );
  const emiTotalPayment = monthlyEmi * emiMonths;
  const emiTotalInterest = emiTotalPayment - loanAmount;

  // 5. GST CALCULATOR
  const [gstAmount, setGstAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [gstMode, setGstMode] = useState('exclusive');

  const calculatedGst = gstMode === 'exclusive' 
    ? (gstAmount * (gstRate / 100))
    : (gstAmount - (gstAmount * (100 / (100 + gstRate))));
  const gstNetTotal = gstMode === 'exclusive' ? (gstAmount + calculatedGst) : gstAmount;

  // 6. EXPENSES TRACKER
  const [expenses, setExpenses] = useState([
    { id: 1, text: 'Server Infrastructure', amount: 45, type: 'expense' },
    { id: 2, text: 'Client Milestone Payment', amount: 1500, type: 'income' },
    { id: 3, text: 'Domain Registration', amount: 14, type: 'expense' }
  ]);
  const [expText, setExpText] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expType, setExpType] = useState('expense');

  const addExpense = (e) => {
    e.preventDefault();
    if (!expText || !expAmount) return;
    setExpenses([
      { id: Date.now(), text: expText, amount: Number(expAmount), type: expType },
      ...expenses
    ]);
    setExpText('');
    setExpAmount('');
    playCoin();
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'invoice', label: 'INVOICE MAKER', icon: Receipt },
          { id: 'currency', label: 'CURRENCY CONVERTER', icon: ArrowRightLeft },
          { id: 'sip', label: 'MUTUAL FUNDS / SIP', icon: TrendingUp },
          { id: 'emi', label: 'LOAN & EMI CALC', icon: Calculator },
          { id: 'gst', label: 'GST & TAX SLABS', icon: DollarSign },
          { id: 'expenses', label: 'EXPENSE TRACKER', icon: Wallet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? 'btn-pixel-emerald' : 'btn-pixel-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. INVOICE GENERATOR */}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          <div className="pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border">
            <span className="font-pixel text-[10px] text-arcade-emerald uppercase">INVOICE SPECIFICATIONS</span>
            <div className="space-y-3">
              <div>
                <label className="text-arcade-muted block mb-1">Company / Issuer</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2"
                />
              </div>

              <div>
                <label className="text-arcade-muted block mb-1">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-arcade-muted block mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-deck-bg border border-deck-border p-2"
                  />
                </div>
                <div>
                  <label className="text-arcade-muted block mb-1">Tax Rate %</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-deck-bg border border-deck-border p-2"
                  />
                </div>
              </div>

              <button
                onClick={exportInvoicePdf}
                className="btn-pixel btn-pixel-emerald w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 mt-2"
              >
                <Printer className="w-4 h-4" />
                PRINT / EXPORT PDF
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border">
            <div className="flex items-center justify-between border-b border-deck-border pb-3">
              <span className="font-pixel text-xs">BILLABLE LINE ITEMS</span>
              <button
                onClick={addItem}
                className="btn-pixel btn-pixel-surface px-3 py-1 font-pixel text-[8px] text-arcade-emerald flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> ADD ITEM
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-deck-bg p-2 border border-deck-border">
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].desc = e.target.value;
                      setItems(updated);
                    }}
                    placeholder="Description"
                    className="flex-1 bg-transparent focus:outline-none"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].qty = Number(e.target.value);
                      setItems(updated);
                    }}
                    placeholder="Qty"
                    className="w-16 bg-deck-surface border border-deck-border p-1 text-center"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].rate = Number(e.target.value);
                      setItems(updated);
                    }}
                    placeholder="Rate"
                    className="w-20 bg-deck-surface border border-deck-border p-1 text-right"
                  />
                  <div className="w-24 text-right font-bold text-arcade-emerald">
                    ${(item.qty * item.rate).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-arcade-coral hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-deck-border pt-4 flex flex-col items-end space-y-1">
              <div className="text-arcade-muted">Subtotal: <span>${subtotal.toFixed(2)}</span></div>
              <div className="text-arcade-muted">Tax ({taxRate}%): <span>${taxAmount.toFixed(2)}</span></div>
              <div className="font-pixel text-base text-arcade-emerald pt-2">
                TOTAL: ${grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CURRENCY CONVERTER */}
      {activeTab === 'currency' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-cyan uppercase">REAL-TIME CURRENCY CONVERTER</span>

          <div className="space-y-3 text-left">
            <div>
              <label className="text-arcade-muted block mb-1">Amount to Convert</label>
              <input
                type="number"
                value={currAmount}
                onChange={(e) => setCurrAmount(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2.5 text-base font-bold"
              />
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-2">
                <label className="text-arcade-muted block mb-1">From Currency</label>
                <select
                  value={currFrom}
                  onChange={(e) => setCurrFrom(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-xs font-bold"
                >
                  {Object.keys(EXCHANGE_RATES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center pt-5">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  className="btn-pixel btn-pixel-surface p-2"
                  title="Swap Currencies"
                >
                  <ArrowRightLeft className="w-4 h-4 text-arcade-amber" />
                </button>
              </div>

              <div className="col-span-2">
                <label className="text-arcade-muted block mb-1">To Currency</label>
                <select
                  value={currTo}
                  onChange={(e) => setCurrTo(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-xs font-bold"
                >
                  {Object.keys(EXCHANGE_RATES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-deck-bg border-2 border-arcade-emerald space-y-1">
            <span className="text-[10px] text-arcade-muted font-pixel">EXCHANGE RESULT</span>
            <div className="font-pixel text-3xl text-arcade-emerald py-1 text-glow-emerald">
              {currConverted} {currTo}
            </div>
            <div className="text-[11px] text-arcade-muted">
              1 {currFrom} = {(EXCHANGE_RATES[currTo] / EXCHANGE_RATES[currFrom]).toFixed(4)} {currTo}
            </div>
          </div>
        </div>
      )}

      {/* 3. SIP & MUTUAL FUNDS */}
      {activeTab === 'sip' && (
        <div className="max-w-lg mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-arcade-muted mb-1">
                <span>Monthly Investment ($)</span>
                <span className="font-bold">${sipMonthly}</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(Number(e.target.value))}
                className="w-full accent-arcade-emerald"
              />
            </div>

            <div>
              <div className="flex justify-between text-arcade-muted mb-1">
                <span>Expected Annual Return (%)</span>
                <span className="font-bold">{sipRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={sipRate}
                onChange={(e) => setSipRate(Number(e.target.value))}
                className="w-full accent-arcade-cyan"
              />
            </div>

            <div>
              <div className="flex justify-between text-arcade-muted mb-1">
                <span>Time Period (Years)</span>
                <span className="font-bold">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full accent-arcade-amber"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-3">
            <div className="flex justify-between text-arcade-muted">
              <span>Total Invested:</span>
              <span className="font-bold">${sipInvested.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Estimated Wealth Gains:</span>
              <span className="text-arcade-emerald font-bold">+${sipReturns.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-arcade-amber font-bold border-t border-deck-border pt-2 text-sm">
              <span>Maturity Total:</span>
              <span className="font-pixel text-base">${sipTotalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. EMI CALCULATOR */}
      {activeTab === 'emi' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Loan Amount ($)</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Interest Rate %</label>
              <input
                type="number"
                step="0.1"
                value={loanInterest}
                onChange={(e) => setLoanInterest(Number(e.target.value))}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Tenure (Years)</label>
              <input
                type="number"
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2 pt-3">
            <div className="text-center pb-2 border-b border-deck-border">
              <span className="text-[10px] text-arcade-muted font-pixel">MONTHLY EMI</span>
              <div className="font-pixel text-2xl text-arcade-emerald mt-1">
                ${monthlyEmi.toLocaleString()} / mo
              </div>
            </div>
            <div className="flex justify-between text-arcade-muted pt-2">
              <span>Total Interest:</span>
              <span className="text-arcade-coral">${emiTotalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Payment:</span>
              <span>${emiTotalPayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. GST & TAX SLABS */}
      {activeTab === 'gst' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Amount ($)</label>
            <input
              type="number"
              value={gstAmount}
              onChange={(e) => setGstAmount(Number(e.target.value))}
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Tax Slab %</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full bg-deck-bg border border-deck-border p-2"
              >
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Mode</label>
              <select
                value={gstMode}
                onChange={(e) => setGstMode(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2"
              >
                <option value="exclusive">Exclusive (+ Tax)</option>
                <option value="inclusive">Inclusive (- Tax)</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2">
            <div className="flex justify-between text-arcade-muted">
              <span>GST Tax Amount:</span>
              <span className="text-arcade-coral">${calculatedGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>CGST / SGST (50% Split):</span>
              <span>${(calculatedGst / 2).toFixed(2)} each</span>
            </div>
            <div className="flex justify-between font-bold text-arcade-emerald border-t border-deck-border pt-2 text-sm">
              <span>Net Total:</span>
              <span className="font-pixel">${gstNetTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXPENSE TRACKER */}
      {activeTab === 'expenses' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">TOTAL INCOME</div>
              <div className="font-pixel text-sm text-arcade-emerald">+${totalIncome.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">TOTAL EXPENSE</div>
              <div className="font-pixel text-sm text-arcade-coral">-${totalExpenses.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">NET BALANCE</div>
              <div className={`font-pixel text-sm ${netBalance >= 0 ? 'text-arcade-emerald' : 'text-arcade-coral'}`}>
                ${netBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <form onSubmit={addExpense} className="flex gap-2">
            <input
              type="text"
              value={expText}
              onChange={(e) => setExpText(e.target.value)}
              placeholder="Description"
              className="flex-1 bg-deck-bg border border-deck-border p-2"
            />
            <input
              type="number"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              placeholder="Amount ($)"
              className="w-28 bg-deck-bg border border-deck-border p-2"
            />
            <select
              value={expType}
              onChange={(e) => setExpType(e.target.value)}
              className="bg-deck-bg border border-deck-border p-2"
            >
              <option value="expense">Expense (-)</option>
              <option value="income">Income (+)</option>
            </select>
            <button
              type="submit"
              className="btn-pixel btn-pixel-emerald px-4 font-pixel text-[9px]"
            >
              LOG
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.map(e => (
              <div
                key={e.id}
                className="p-2.5 bg-deck-bg border border-deck-border flex items-center justify-between"
              >
                <span className="font-bold">{e.text}</span>
                <span className={`font-pixel text-xs ${e.type === 'income' ? 'text-arcade-emerald' : 'text-arcade-coral'}`}>
                  {e.type === 'income' ? '+' : '-'}${e.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
