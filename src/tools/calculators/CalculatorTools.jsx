import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, PieChart, TrendingUp, Zap, Fuel, 
  Percent, Tag, Heart, Calendar, Play, RotateCcw, Download, Scale
} from 'lucide-react';
import { playClick, playBeep, playCoin } from '../../audio/soundEffects';

export default function CalculatorTools() {
  const [activeTab, setActiveTab] = useState('scientific'); 
  // 'scientific' | 'units' | 'tip' | 'loan' | 'age' | 'bmi' | 'discount' | 'fuel' | 'electricity' | 'charts'

  // TIP & BILL SPLIT CALCULATOR
  const [billAmount, setBillAmount] = useState(0);
  const [tipPercent, setTipPercent] = useState(0);
  const [splitCount, setSplitCount] = useState(1);
  const [roundUp, setRoundUp] = useState(false);

  // Helper to remove leading zero when typing (e.g. typing 653 won't become 0653)
  const handleCleanNum = (setter) => (e) => {
    let val = e.target.value;
    if (val === '') {
      setter(0);
      return;
    }
    if (/^0[0-9]+/.test(val)) {
      val = val.replace(/^0+/, '');
      if (val === '') val = '0';
    }
    setter(Number(val) || 0);
  };

  const rawTip = (Number(billAmount) * Number(tipPercent)) / 100;
  const rawTotal = Number(billAmount) + rawTip;
  const finalTotal = roundUp ? Math.ceil(rawTotal) : rawTotal;
  const finalTip = roundUp ? finalTotal - Number(billAmount) : rawTip;
  const perPersonTotal = splitCount > 0 ? (finalTotal / splitCount).toFixed(2) : 0;
  const perPersonTip = splitCount > 0 ? (finalTip / splitCount).toFixed(2) : 0;

  // LOAN & MORTGAGE AMORTIZATION
  const [loanPrincipal, setLoanPrincipal] = useState(0);
  const [loanRate, setLoanRate] = useState(0);
  const [loanYears, setLoanYears] = useState(0);

  const monthlyRate = (Number(loanRate) / 100) / 12;
  const totalMonths = Number(loanYears) * 12;
  const monthlyPayment = (monthlyRate > 0 && totalMonths > 0)
    ? (Number(loanPrincipal) * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)).toFixed(2)
    : 0;
  const totalLoanCost = (monthlyPayment * totalMonths).toFixed(2);
  const totalLoanInterest = (totalLoanCost - Number(loanPrincipal)).toFixed(2);

  // Scientific Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState([]);
  const [isRad, setIsRad] = useState(true);

  const handleCalcInput = (btn) => {
    playClick();
    if (btn === 'C') {
      setCalcDisplay('0');
    } else if (btn === 'DEL') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (btn === '=') {
      try {
        let expr = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, isRad ? 'Math.sin(' : 'Math.sin((Math.PI/180)*')
          .replace(/cos\(/g, isRad ? 'Math.cos(' : 'Math.cos((Math.PI/180)*')
          .replace(/tan\(/g, isRad ? 'Math.tan(' : 'Math.tan((Math.PI/180)*')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/sqrt\(/g, 'Math.sqrt(');

        const res = Function(`'use strict'; return (${expr})`)();
        const finalVal = Number.isFinite(res) ? String(parseFloat(res.toFixed(8))) : 'Error';
        setCalcHistory(prev => [`${calcDisplay} = ${finalVal}`, ...prev.slice(0, 10)]);
        setCalcDisplay(finalVal);
        playCoin();
      } catch (err) {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay(prev => prev === '0' || prev === 'Error' ? btn : prev + btn);
    }
  };

  // Universal Unit Converter State
  const [unitCategory, setUnitCategory] = useState('length'); // 'length' | 'weight' | 'temperature' | 'data' | 'speed'
  const [unitFromVal, setUnitFromVal] = useState(1);
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');
  const [unitResult, setUnitResult] = useState('');

  const UNIT_CONVERSIONS = {
    length: {
      units: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'],
      toBase: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 }
    },
    weight: {
      units: ['kg', 'g', 'mg', 'lb', 'oz', 'ton'],
      toBase: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000 }
    },
    speed: {
      units: ['km/h', 'mph', 'm/s', 'knots'],
      toBase: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knots: 0.514444 }
    },
    data: {
      units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
      toBase: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624 }
    }
  };

  useEffect(() => {
    if (unitCategory === 'temperature') {
      const val = Number(unitFromVal) || 0;
      let res = val;
      if (unitFrom === 'C' && unitTo === 'F') res = (val * 9/5) + 32;
      else if (unitFrom === 'F' && unitTo === 'C') res = (val - 32) * 5/9;
      else if (unitFrom === 'C' && unitTo === 'K') res = val + 273.15;
      else if (unitFrom === 'K' && unitTo === 'C') res = val - 273.15;
      else if (unitFrom === 'F' && unitTo === 'K') res = (val - 32) * 5/9 + 273.15;
      else if (unitFrom === 'K' && unitTo === 'F') res = (val - 273.15) * 9/5 + 32;
      setUnitResult(parseFloat(res.toFixed(4)).toString());
    } else {
      const cat = UNIT_CONVERSIONS[unitCategory];
      if (cat) {
        const val = Number(unitFromVal) || 0;
        const base = val * (cat.toBase[unitFrom] || 1);
        const out = base / (cat.toBase[unitTo] || 1);
        setUnitResult(parseFloat(out.toFixed(6)).toString());
      }
    }
  }, [unitCategory, unitFromVal, unitFrom, unitTo]);

  // Exact Age Calculator down to seconds
  const [birthDate, setBirthDate] = useState('2000-01-01T00:00');
  const [liveAge, setLiveAge] = useState(null);

  useEffect(() => {
    const updateAge = () => {
      const birth = new Date(birthDate).getTime();
      const now = Date.now();
      if (isNaN(birth) || birth > now) return;

      const diff = now - birth;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const years = (diff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(8);

      setLiveAge({
        yearsFloat: years,
        totalDays: days.toLocaleString(),
        totalHours: hours.toLocaleString(),
        totalMinutes: minutes.toLocaleString(),
        totalSeconds: seconds.toLocaleString(),
        exactSecs: seconds % 60,
        exactMins: minutes % 60,
        exactHours: hours % 24,
      });
    };

    updateAge();
    const interval = setInterval(updateAge, 500);
    return () => clearInterval(interval);
  }, [birthDate]);

  // BMI Calculator
  const [bmiWeight, setBmiWeight] = useState(0);
  const [bmiHeight, setBmiHeight] = useState(0);
  const [bmiResult, setBmiResult] = useState(null);

  useEffect(() => {
    const hM = Number(bmiHeight) / 100;
    const w = Number(bmiWeight);
    if (hM > 0 && w > 0) {
      const val = (w / (hM * hM)).toFixed(1);
      let cat = 'Normal Weight';
      let col = 'text-arcade-emerald';
      if (val < 18.5) { cat = 'Underweight'; col = 'text-arcade-cyan'; }
      else if (val >= 25 && val < 30) { cat = 'Overweight'; col = 'text-arcade-amber'; }
      else if (val >= 30) { cat = 'Obesity'; col = 'text-arcade-coral'; }
      setBmiResult({ val, cat, col });
    } else {
      setBmiResult(null);
    }
  }, [bmiWeight, bmiHeight]);

  // Discount Calculator
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);

  const discountAmount = (Number(originalPrice) * (Number(discountPercent) / 100));
  const priceAfterDiscount = Number(originalPrice) - discountAmount;
  const taxAmount = (priceAfterDiscount * (Number(taxPercent) / 100));
  const finalPrice = priceAfterDiscount + taxAmount;

  // Electricity Calculator
  const [wattage, setWattage] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(0);
  const [kwhRate, setKwhRate] = useState(0);

  const dailyKwh = (Number(wattage) * Number(hoursPerDay)) / 1000;
  const dailyCost = dailyKwh * Number(kwhRate);
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  // Fuel / Mileage Calculator
  const [tripDistance, setTripDistance] = useState(0);
  const [fuelEfficiency, setFuelEfficiency] = useState(0);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(0);
  const [passengers, setPassengers] = useState(1);

  const totalFuelNeeded = fuelEfficiency > 0 ? Number(tripDistance) / Number(fuelEfficiency) : 0;
  const totalTripCost = totalFuelNeeded * Number(fuelPricePerLitre);
  const costPerPerson = passengers > 0 ? totalTripCost / Number(passengers) : totalTripCost;

  // Line / Pie Chart Maker
  const [chartType, setChartType] = useState('pie');
  const [chartLabels, setChartLabels] = useState('Hardware, Network, Cloud, Design, Security');
  const [chartValues, setChartValues] = useState('1200, 600, 400, 300, 800');
  const chartCanvasRef = useRef(null);

  useEffect(() => {
    if (activeTab !== 'charts' || !chartCanvasRef.current) return;
    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const labels = chartLabels.split(',').map(s => s.trim());
    const values = chartValues.split(',').map(s => Number(s.trim()) || 0);
    const colors = ['#00ff88', '#00f0ff', '#ffb703', '#ff4757', '#a78bfa', '#3b82f6'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (chartType === 'pie') {
      const total = values.reduce((a, b) => a + b, 0) || 1;
      let startAngle = 0;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 30;

      values.forEach((val, i) => {
        const sliceAngle = (val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle += sliceAngle;
      });
    } else {
      const maxVal = Math.max(...values, 10);
      const barWidth = (canvas.width - 60) / values.length;
      values.forEach((val, i) => {
        const barHeight = (val / maxVal) * (canvas.height - 80);
        const x = 40 + i * barWidth;
        const y = canvas.height - 40 - barHeight;

        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

        ctx.fillStyle = '#0f172a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i] || '', x + barWidth / 2, canvas.height - 20);
        ctx.fillText(String(val), x + barWidth / 2, y - 5);
      });
    }
  }, [activeTab, chartType, chartLabels, chartValues]);

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'scientific', label: 'SCIENTIFIC CALC', icon: Calculator },
          { id: 'units', label: 'UNIT CONVERTER', icon: Scale },
          { id: 'tip', label: 'TIP & BILL SPLIT', icon: Percent },
          { id: 'loan', label: 'LOAN AMORTIZATION', icon: TrendingUp },
          { id: 'age', label: 'EXACT AGE (LIVE)', icon: Calendar },
          { id: 'bmi', label: 'BMI HEALTH', icon: Heart },
          { id: 'discount', label: 'DISCOUNT & TAX', icon: Tag },
          { id: 'fuel', label: 'FUEL & MILEAGE', icon: Fuel },
          { id: 'electricity', label: 'POWER CONSUMPTION', icon: Zap },
          { id: 'charts', label: 'PIE & BAR CHARTS', icon: PieChart },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? 'btn-pixel-amber' : 'btn-pixel-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. SCIENTIFIC CALCULATOR */}
      {activeTab === 'scientific' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-3 sm:p-6 space-y-3 sm:space-y-4 border border-deck-border w-full">
          <div className="p-3 sm:p-4 bg-deck-bg border-2 border-black space-y-1">
            <div className="text-[10px] text-arcade-muted font-mono flex justify-between">
              <span>{isRad ? 'RAD' : 'DEG'} • SCIENTIFIC MATRIX</span>
              <span className="truncate max-w-[120px]">{calcHistory[0] || ''}</span>
            </div>
            <div className="font-pixel text-xl sm:text-2xl md:text-3xl text-arcade-amber text-right truncate text-glow-amber">
              {calcDisplay}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1 sm:gap-2 font-mono font-bold text-xs">
            <button onClick={() => setIsRad(!isRad)} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-arcade-cyan font-pixel text-[7px] sm:text-[8px] flex items-center justify-center">
              {isRad ? 'RAD' : 'DEG'}
            </button>
            <button onClick={() => handleCalcInput('sin(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">sin</button>
            <button onClick={() => handleCalcInput('cos(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">cos</button>
            <button onClick={() => handleCalcInput('tan(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">tan</button>
            <button onClick={() => handleCalcInput('C')} className="p-1.5 sm:p-2.5 bg-red-950/20 border border-arcade-coral text-arcade-coral font-bold text-[11px] sm:text-xs">C</button>
            <button onClick={() => handleCalcInput('DEL')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-arcade-coral text-[10px] sm:text-xs">DEL</button>

            <button onClick={() => handleCalcInput('ln(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">ln</button>
            <button onClick={() => handleCalcInput('log(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">log</button>
            <button onClick={() => handleCalcInput('sqrt(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">√</button>
            <button onClick={() => handleCalcInput('(')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">(</button>
            <button onClick={() => handleCalcInput(')')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">)</button>
            <button onClick={() => handleCalcInput('÷')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-arcade-amber text-arcade-amber text-xs sm:text-sm">÷</button>

            <button onClick={() => handleCalcInput('π')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-arcade-emerald text-[11px] sm:text-xs">π</button>
            <button onClick={() => handleCalcInput('7')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">7</button>
            <button onClick={() => handleCalcInput('8')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">8</button>
            <button onClick={() => handleCalcInput('9')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">9</button>
            <button onClick={() => handleCalcInput('×')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-arcade-amber text-arcade-amber text-xs sm:text-sm">×</button>
            <button onClick={() => handleCalcInput('e')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-arcade-emerald text-[11px] sm:text-xs">e</button>

            <button onClick={() => handleCalcInput('**')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">xʸ</button>
            <button onClick={() => handleCalcInput('4')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">4</button>
            <button onClick={() => handleCalcInput('5')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">5</button>
            <button onClick={() => handleCalcInput('6')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">6</button>
            <button onClick={() => handleCalcInput('-')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-arcade-amber text-arcade-amber text-xs sm:text-sm">-</button>
            <button onClick={() => handleCalcInput('%')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">%</button>

            <button onClick={() => handleCalcInput('.')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-deck-border text-[11px] sm:text-xs">.</button>
            <button onClick={() => handleCalcInput('1')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">1</button>
            <button onClick={() => handleCalcInput('2')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">2</button>
            <button onClick={() => handleCalcInput('3')} className="p-2 sm:p-3 bg-deck-bg border border-deck-border hover:bg-deck-surface text-xs sm:text-sm">3</button>
            <button onClick={() => handleCalcInput('+')} className="p-1.5 sm:p-2.5 bg-deck-surface border border-arcade-amber text-arcade-amber text-xs sm:text-sm">+</button>
            <button onClick={() => handleCalcInput('=')} className="p-1.5 sm:p-2.5 bg-arcade-emerald text-black font-pixel text-[10px] sm:text-xs border border-black shadow-pixel-sm">=</button>
          </div>
        </div>
      )}

      {/* 2. UNIVERSAL UNIT CONVERTER */}
      {activeTab === 'units' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs">
          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-deck-border pb-3">
            {[
              { id: 'length', label: 'LENGTH' },
              { id: 'weight', label: 'MASS/WEIGHT' },
              { id: 'temperature', label: 'TEMPERATURE' },
              { id: 'speed', label: 'SPEED' },
              { id: 'data', label: 'DIGITAL STORAGE' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setUnitCategory(cat.id);
                  if (cat.id === 'temperature') {
                    setUnitFrom('C'); setUnitTo('F');
                  } else {
                    const u = UNIT_CONVERSIONS[cat.id].units;
                    setUnitFrom(u[0]); setUnitTo(u[1] || u[0]);
                  }
                  playClick();
                }}
                className={`px-3 py-1.5 font-pixel text-[8px] border shrink-0 ${
                  unitCategory === cat.id ? 'bg-deck-surface border-arcade-amber text-arcade-amber font-bold' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <label className="text-arcade-muted">From Value</label>
              <input
                type="number"
                value={unitFromVal}
                onChange={(e) => setUnitFromVal(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2.5 text-sm font-bold"
              />
              <select
                value={unitFrom}
                onChange={(e) => setUnitFrom(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-xs uppercase"
              >
                {unitCategory === 'temperature' ? (
                  <>
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </>
                ) : (
                  UNIT_CONVERSIONS[unitCategory]?.units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-arcade-muted">Converted Result</label>
              <div className="w-full bg-deck-bg border-2 border-arcade-emerald p-2.5 text-sm font-bold font-pixel text-arcade-emerald truncate">
                {unitResult}
              </div>
              <select
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-xs uppercase"
              >
                {unitCategory === 'temperature' ? (
                  <>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="C">Celsius (°C)</option>
                    <option value="K">Kelvin (K)</option>
                  </>
                ) : (
                  UNIT_CONVERSIONS[unitCategory]?.units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXACT AGE DOWN TO SECONDS LIVE */}
      {activeTab === 'age' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <div>
            <label className="text-arcade-muted block mb-2 font-pixel text-[10px]">SELECT BIRTH DATE & TIME</label>
            <input
              type="datetime-local"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-deck-bg border-2 border-deck-border p-3 font-mono text-sm"
            />
          </div>

          {liveAge && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-deck-bg border-2 border-arcade-emerald">
                <span className="text-[10px] text-arcade-muted uppercase font-pixel">EXACT LIVE AGE</span>
                <div className="font-pixel text-2xl sm:text-3xl text-arcade-emerald py-2 text-glow-emerald">
                  {liveAge.yearsFloat} YEARS
                </div>
                <div className="text-arcade-cyan text-xs">
                  {liveAge.exactHours}h {liveAge.exactMins}m {liveAge.exactSecs}s Ticking Live
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-deck-bg border border-deck-border">
                  <div className="text-arcade-muted text-[10px]">TOTAL DAYS LIVED</div>
                  <div className="font-pixel text-base text-arcade-amber">{liveAge.totalDays} Days</div>
                </div>
                <div className="p-3 bg-deck-bg border border-deck-border">
                  <div className="text-arcade-muted text-[10px]">TOTAL HOURS</div>
                  <div className="font-pixel text-base text-arcade-coral">{liveAge.totalHours} Hours</div>
                </div>
                <div className="p-3 bg-deck-bg border border-deck-border">
                  <div className="text-arcade-muted text-[10px]">TOTAL MINUTES</div>
                  <div className="font-pixel text-base text-arcade-cyan">{liveAge.totalMinutes} Mins</div>
                </div>
                <div className="p-3 bg-deck-bg border border-deck-border">
                  <div className="text-arcade-muted text-[10px]">TOTAL SECONDS</div>
                  <div className="font-pixel text-base text-arcade-emerald">{liveAge.totalSeconds} Secs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. BMI CALCULATOR */}
      {activeTab === 'bmi' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-arcade-muted mb-1">
                <span>Weight (kg)</span>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={bmiWeight}
                  onChange={handleCleanNum(setBmiWeight)}
                  onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                  className="w-20 px-2 py-0.5 bg-deck-bg border border-deck-border font-pixel text-[10px] text-arcade-emerald text-right"
                />
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(Number(e.target.value))}
                className="w-full accent-arcade-emerald"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-arcade-muted mb-1">
                <span>Height (cm)</span>
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={bmiHeight}
                  onChange={handleCleanNum(setBmiHeight)}
                  onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                  className="w-20 px-2 py-0.5 bg-deck-bg border border-deck-border font-pixel text-[10px] text-arcade-cyan text-right"
                />
              </div>
              <input
                type="range"
                min="0"
                max="230"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(Number(e.target.value))}
                className="w-full accent-arcade-cyan"
              />
            </div>
          </div>

          {bmiResult && (
            <div className="p-4 bg-deck-bg border-2 border-deck-border text-center space-y-2">
              <span className="text-[10px] text-arcade-muted font-pixel">BODY MASS INDEX (BMI)</span>
              <div className={`font-pixel text-4xl ${bmiResult.col}`}>
                {bmiResult.val}
              </div>
              <div className="font-bold text-sm">
                Category: <span className={bmiResult.col}>{bmiResult.cat}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. DISCOUNT & TAX */}
      {activeTab === 'discount' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Original Price ($)</label>
            <input
              type="number"
              value={originalPrice}
              onChange={handleCleanNum(setOriginalPrice)}
              onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
              className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Discount %</label>
              <input
                type="number"
                value={discountPercent}
                onChange={handleCleanNum(setDiscountPercent)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-sm text-arcade-emerald"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Tax / VAT %</label>
              <input
                type="number"
                value={taxPercent}
                onChange={handleCleanNum(setTaxPercent)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-sm text-arcade-coral"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2 pt-3">
            <div className="flex justify-between text-arcade-muted">
              <span>Discount Savings:</span>
              <span className="text-arcade-emerald">-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Estimated Tax:</span>
              <span className="text-arcade-coral">+${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-deck-border pt-2">
              <span>Final Total:</span>
              <span className="text-arcade-amber font-pixel text-base">${finalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. FUEL & MILEAGE */}
      {activeTab === 'fuel' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Trip Distance (km)</label>
              <input
                type="number"
                value={tripDistance}
                onChange={handleCleanNum(setTripDistance)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Mileage (km/L)</label>
              <input
                type="number"
                value={fuelEfficiency}
                onChange={handleCleanNum(setFuelEfficiency)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Fuel Price ($/L)</label>
              <input
                type="number"
                value={fuelPricePerLitre}
                onChange={handleCleanNum(setFuelPricePerLitre)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Passengers (Split)</label>
              <input
                type="number"
                min="1"
                value={passengers}
                onChange={handleCleanNum(setPassengers)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2">
            <div className="flex justify-between text-arcade-muted">
              <span>Fuel Needed:</span>
              <span className="font-bold">{totalFuelNeeded.toFixed(1)} Litres</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Total Trip Cost:</span>
              <span className="text-arcade-amber font-bold">${totalTripCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-arcade-emerald font-bold border-t border-deck-border pt-2 text-sm">
              <span>Cost Per Person:</span>
              <span className="font-pixel">${costPerPerson.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. ELECTRICITY */}
      {activeTab === 'electricity' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Appliance Wattage (Watts)</label>
            <input
              type="number"
              value={wattage}
              onChange={handleCleanNum(setWattage)}
              onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
              className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Hours Used Per Day</label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={handleCleanNum(setHoursPerDay)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Cost Per kWh ($)</label>
              <input
                type="number"
                step="0.01"
                value={kwhRate}
                onChange={handleCleanNum(setKwhRate)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2">
            <div className="flex justify-between text-arcade-muted">
              <span>Daily Energy:</span>
              <span className="font-bold">{dailyKwh.toFixed(2)} kWh</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Daily Cost:</span>
              <span className="text-arcade-amber font-bold">${dailyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Monthly Cost (30 Days):</span>
              <span className="text-arcade-amber font-bold">${monthlyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-deck-border pt-2 text-arcade-emerald text-sm">
              <span>Annual Forecast:</span>
              <span className="font-pixel">${yearlyCost.toFixed(2)} / yr</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. CHARTS MAKER */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChartType('pie')}
                className={`flex-1 py-2 font-pixel text-[9px] border ${
                  chartType === 'pie' ? 'bg-deck-surface border-arcade-amber text-arcade-amber' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                PIE CHART
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`flex-1 py-2 font-pixel text-[9px] border ${
                  chartType === 'bar' ? 'bg-deck-surface border-arcade-amber text-arcade-amber' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                BAR CHART
              </button>
            </div>

            <div>
              <label className="text-arcade-muted block mb-1">Labels (Comma Separated)</label>
              <input
                type="text"
                value={chartLabels}
                onChange={(e) => setChartLabels(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>

            <div>
              <label className="text-arcade-muted block mb-1">Values (Comma Separated)</label>
              <input
                type="text"
                value={chartValues}
                onChange={(e) => setChartValues(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div className="pixel-card bg-deck-dark p-6 flex flex-col items-center justify-center border border-deck-border">
            <canvas ref={chartCanvasRef} width={380} height={280} className="max-w-full" />
          </div>
        </div>
      )}

      {/* TIP & BILL SPLIT */}
      {activeTab === 'tip' && (
        <div className="max-w-lg mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">TIP & BILL SPLITTER</span>
            <span className="font-pixel text-[9px] text-arcade-emerald">EVEN ALLOCATION</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-arcade-muted block mb-1">Bill Amount ($)</label>
              <input
                type="number"
                value={billAmount}
                onChange={handleCleanNum(setBillAmount)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-base text-arcade-emerald"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Number of People</label>
              <input
                type="number"
                min="1"
                max="50"
                value={splitCount}
                onChange={handleCleanNum(setSplitCount)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-base"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-arcade-muted">Tip Percentage ({tipPercent}%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={tipPercent}
                onChange={handleCleanNum(setTipPercent)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-16 px-1.5 py-0.5 bg-deck-bg border border-deck-border font-pixel text-[9px] text-arcade-amber text-right"
              />
            </div>
            <div className="flex gap-2">
              {[0, 10, 15, 18, 20, 25].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTipPercent(p)}
                  className={`flex-1 py-1.5 font-pixel text-[9px] border ${
                    tipPercent === p ? 'bg-amber-400 text-black border-black font-bold' : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={roundUp}
              onChange={(e) => setRoundUp(e.target.checked)}
              className="accent-arcade-emerald"
            />
            <span>Round Up to Nearest Dollar ($)</span>
          </label>

          <div className="p-6 bg-deck-bg border-2 border-black shadow-pixel space-y-3">
            <div className="flex justify-between items-center border-b border-deck-border pb-2">
              <span className="text-arcade-muted">TOTAL PER PERSON:</span>
              <strong className="font-pixel text-2xl text-arcade-emerald">${perPersonTotal}</strong>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Tip Per Person:</span>
              <span className="text-arcade-amber font-pixel">${perPersonTip}</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Total Tip ({tipPercent}%):</span>
              <span className="text-arcade-amber font-pixel">${finalTip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-arcade-muted">
              <span>Grand Total:</span>
              <span className="text-arcade-paper font-pixel">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* LOAN & MORTGAGE AMORTIZATION */}
      {activeTab === 'loan' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">LOAN & MORTGAGE AMORTIZATION</span>
            <span className="font-pixel text-[9px] text-arcade-amber">COMPOUND INTEREST</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Principal ($)</label>
              <input
                type="number"
                value={loanPrincipal}
                onChange={handleCleanNum(setLoanPrincipal)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={handleCleanNum(setLoanRate)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Term (Years)</label>
              <input
                type="number"
                value={loanYears}
                onChange={handleCleanNum(setLoanYears)}
                onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
              />
            </div>
          </div>

          <div className="p-6 bg-deck-bg border-2 border-black shadow-pixel space-y-3">
            <div className="text-arcade-muted text-[10px] font-pixel">ESTIMATED MONTHLY PAYMENT</div>
            <div className="font-pixel text-4xl text-arcade-emerald py-1">
              ${monthlyPayment} <span className="text-sm">/ MO</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-deck-border">
              <div>
                <span className="text-arcade-muted text-[10px] block">TOTAL INTEREST</span>
                <strong className="text-arcade-coral font-pixel text-sm">${totalLoanInterest}</strong>
              </div>
              <div>
                <span className="text-arcade-muted text-[10px] block">TOTAL COST OF LOAN</span>
                <strong className="text-arcade-amber font-pixel text-sm">${totalLoanCost}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
