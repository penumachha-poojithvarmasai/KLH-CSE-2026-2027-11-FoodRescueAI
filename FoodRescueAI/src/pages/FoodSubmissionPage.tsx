import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { FoodCategory, PerishabilityLevel, UrgencyLevel } from '../types';
import { 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  Flame, 
  Cookie, 
  Apple, 
  Bot
} from 'lucide-react';


export const FoodSubmissionPage: React.FC = () => {
  const { addFoodSubmission, setActiveTab } = useApp();

  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('meals');
  const [estimatedServings, setEstimatedServings] = useState<number>(50);
  const [storageCondition, setStorageCondition] = useState<'Ambient' | 'Refrigerated' | 'Frozen' | 'Hot Held'>('Hot Held');
  const [address, setAddress] = useState('Grand Horizon Campus Canteen, HITEC City, Hyderabad');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-time calculated properties
  const [remainingHours, setRemainingHours] = useState<number>(4);
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [perishability, setPerishability] = useState<PerishabilityLevel>('HIGH');

  // Recalculate perishability, usable hours & urgency whenever category/storage condition changes
  useEffect(() => {
    let hours = 4;
    if (category === 'Cooked Meals') {
      hours = storageCondition === 'Hot Held' ? 3 : storageCondition === 'Refrigerated' ? 6 : 2;
    } else if (category === 'Dairy') {
      hours = storageCondition === 'Refrigerated' ? 24 : 4;
    } else if (category === 'Bakery') {
      hours = 24;
    } else if (category === 'Fruits & Vegetables') {
      hours = 48;
    } else {
      hours = 12;
    }

    setRemainingHours(hours);

    if (hours <= 3) {
      setUrgency('CRITICAL');
      setPerishability('CRITICAL');
    } else if (hours <= 6) {
      setUrgency('HIGH');
      setPerishability('HIGH');
    } else if (hours <= 24) {
      setUrgency('MEDIUM');
      setPerishability('MEDIUM');
    } else {
      setUrgency('LOW');
      setPerishability('LOW');
    }
  }, [category, storageCondition]);

  const applyPreset = (presetType: 'HOT_MEAL' | 'BAKERY' | 'PRODUCE' | 'DAIRY') => {
    switch (presetType) {
      case 'HOT_MEAL':
        setFoodName('Fresh Buffet Curry & Steamed Rice');
        setCategory('Cooked Meals');
        setQuantity(80);
        setUnit('meals');
        setEstimatedServings(80);
        setStorageCondition('Hot Held');
        setNotes('Maintained in commercial warmers above 65°C.');
        break;
      case 'BAKERY':
        setFoodName('Assorted Pastries & Whole Sourdough Loaves');
        setCategory('Bakery');
        setQuantity(35);
        setUnit('kg');
        setEstimatedServings(100);
        setStorageCondition('Ambient');
        setNotes('Individually wrapped and boxed.');
        break;
      case 'PRODUCE':
        setFoodName('Surplus Organic Apples & Leafy Greens');
        setCategory('Fruits & Vegetables');
        setQuantity(120);
        setUnit('kg');
        setEstimatedServings(240);
        setStorageCondition('Refrigerated');
        setNotes('Crate packed surplus from morning market.');
        break;
      case 'DAIRY':
        setFoodName('Fresh Organic Milk Cartons & Yogurt Cups');
        setCategory('Dairy');
        setQuantity(60);
        setUnit('liters');
        setEstimatedServings(120);
        setStorageCondition('Refrigerated');
        setNotes('Chilled at 4°C. Best before tomorrow.');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setIsSubmitting(true);
    const newSub = await addFoodSubmission({
      foodName,
      category,
      quantity,
      unit,
      estimatedServings,
      storageCondition,
      location: { address, lat: 17.4483, lng: 78.3748 },
      notes,
      remainingHours,
      urgency,
      perishability
    });

    setIsSubmitting(false);
    setSuccessMessage(`Surplus food item "${newSub.foodName}" successfully reported! AI Agent analyzing matching options...`);

    // Reset form
    setFoodName('');
    setNotes('');

    // After 2.5 seconds redirect to Agent Command Center
    setTimeout(() => {
      setActiveTab('agent');
    }, 2500);
  };

  // AI Vision Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const runVisionScan = (presetKey: string) => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      let result: {
        name: string;
        category: FoodCategory;
        quantity: number;
        unit: string;
        servings: number;
        storage: 'Ambient' | 'Refrigerated' | 'Frozen' | 'Hot Held';
        confidence: number;
        notes: string;
        imageIcon: string;
      } = {
        name: 'Buffet Prepared Warm Meals (Rice & Dal Curry)',
        category: 'Cooked Meals',
        quantity: 65,
        unit: 'meals',
        servings: 65,
        storage: 'Hot Held',
        confidence: 98.2,
        notes: 'AI Vision OCR: Verified steam table temperature >65°C. Safe insulated thermal pack.',
        imageIcon: '🍲'
      };

      if (presetKey === 'BAKERY') {
        result = {
          name: 'Artisan Sourdough Loaves & Croissant Pack',
          category: 'Bakery',
          quantity: 40,
          unit: 'portions',
          servings: 80,
          storage: 'Ambient',
          confidence: 96.5,
          notes: 'AI Vision OCR: Batch baked 4 hours ago. Ambient shelf life 24h.',
          imageIcon: '🥐'
        };
      } else if (presetKey === 'PRODUCE') {
        result = {
          name: 'Fresh Farm Apples & Seasonal Crisp Salad Greens',
          category: 'Fruits & Vegetables',
          quantity: 90,
          unit: 'kg',
          servings: 180,
          storage: 'Refrigerated',
          confidence: 97.8,
          notes: 'AI Vision OCR: Grade-A surplus harvest produce. Optimal nutrition retention.',
          imageIcon: '🥗'
        };
      }

      setScanResult(result);
      setIsScanning(false);
    }, 1200);
  };


  const applyScanResult = () => {
    if (!scanResult) return;
    setFoodName(scanResult.name);
    setCategory(scanResult.category);
    setQuantity(scanResult.quantity);
    setUnit(scanResult.unit);
    setEstimatedServings(scanResult.servings);
    setStorageCondition(scanResult.storage);
    setNotes(scanResult.notes);
    setShowScanner(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Step 1: OBSERVE — Surplus Food Intake</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Surplus Food Submission</h2>
          <p className="text-xs text-slate-400 mt-1">
            Log edible food surplus manually or use the multi-modal AI Vision Scanner for rapid intake.
          </p>
        </div>

        {/* AI Scanner Toggle & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{showScanner ? 'Close AI Scanner' : 'AI Vision Scanner'}</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => applyPreset('HOT_MEAL')}
              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center space-x-1"
            >
              <Flame className="w-3 h-3" />
              <span>Hot Meal</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('BAKERY')}
              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium flex items-center space-x-1"
            >
              <Cookie className="w-3 h-3" />
              <span>Bakery</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('PRODUCE')}
              className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1"
            >
              <Apple className="w-3 h-3" />
              <span>Produce</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Vision Scanner Modal / Panel */}
      {showScanner && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-bold text-sm text-slate-100">Multi-Modal AI Vision & OCR Food Recognition</h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              NEURAL VISION ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Viewfinder simulation */}
            <div className="relative h-44 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden group">
              <div className="absolute inset-2 border border-dashed border-indigo-500/40 rounded-lg pointer-events-none" />
              {isScanning && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-500" />
              )}
              <div className="text-center space-y-2">
                <span className="text-3xl block">{scanResult ? scanResult.imageIcon : '📷'}</span>
                <p className="text-xs text-slate-300 font-medium">
                  {isScanning ? 'Analyzing visual features & thermal OCR tags...' : 'Select item sample below to trigger Vision Scanner'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => runVisionScan('HOT_MEAL')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                  >
                    Scan Buffet Trays
                  </button>
                  <button
                    type="button"
                    onClick={() => runVisionScan('BAKERY')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                  >
                    Scan Bakery Rack
                  </button>
                  <button
                    type="button"
                    onClick={() => runVisionScan('PRODUCE')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                  >
                    Scan Produce Crate
                  </button>
                </div>
              </div>
            </div>

            {/* Scan Output preview */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              {scanResult ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">{scanResult.name}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                      {scanResult.confidence}% Confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Category</span>
                      <span className="font-semibold text-slate-200">{scanResult.category}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Quantity</span>
                      <span className="font-semibold text-slate-200">{scanResult.quantity} {scanResult.unit}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Storage</span>
                      <span className="font-semibold text-slate-200">{scanResult.storage}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    {scanResult.notes}
                  </p>
                  <button
                    type="button"
                    onClick={applyScanResult}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Apply AI Recognition to Form
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-1">
                  <Bot className="w-6 h-6 text-indigo-400 opacity-60 mb-1" />
                  <p className="font-medium text-slate-300">Awaiting Image / Scan Stream</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Neural multi-modal vision detects freshness levels, food categories, and estimated portions automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}


      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5 p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Food Item Name / Title *</label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Hot Vegetable Biryani & Paneer Curry"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Food Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery">Bakery</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Dairy">Dairy</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Storage Condition *</label>
              <select
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Hot Held">Hot Held (&gt;65°C)</option>
                <option value="Refrigerated">Refrigerated (2 - 4°C)</option>
                <option value="Ambient">Ambient / Room Temp</option>
                <option value="Frozen">Frozen (&lt;-18°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => {
                  const q = parseInt(e.target.value) || 1;
                  setQuantity(q);
                  setEstimatedServings(q);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="meals">meals</option>
                <option value="kg">kg</option>
                <option value="boxes">boxes</option>
                <option value="liters">liters</option>
                <option value="portions">portions</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Estimated Servings</label>
              <input
                type="number"
                min="1"
                value={estimatedServings}
                onChange={(e) => setEstimatedServings(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Pickup Location *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Additional Notes / Allergen Alerts</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian meal, contains dairy and nuts, prepared at 12:30 PM."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>{isSubmitting ? 'Analyzing & Triggering Agent...' : 'Submit to AI Agent Workflow'}</span>
          </button>
        </div>

        {/* Real-time Calculated Preview Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">AI Usability & Urgency Calculator</h3>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Estimated Usable Window:</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-slate-100">{remainingHours} Hours</span>
                  <span className="text-[10px] text-emerald-400">Remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400">Perishability</span>
                  <div className="flex items-center space-x-1">
                    <ShieldAlert className={`w-3.5 h-3.5 ${perishability === 'CRITICAL' || perishability === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <span className="text-xs font-bold text-slate-200">{perishability}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400">Urgency Level</span>
                  <div className="flex items-center space-x-1">
                    <Flame className={`w-3.5 h-3.5 ${urgency === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <span className="text-xs font-bold text-slate-200">{urgency}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Deterministic Rule Output:</div>
                <p>
                  Food items logged with <strong>{remainingHours}h remaining usable window</strong> trigger high-priority matching signals to nearest community kitchens and emergency shelters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
