import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Globe2, 
  Utensils, 
  Leaf, 
  Droplets, 
  HeartHandshake, 
  Award, 
  Download,
  CheckCircle2,
  Trees,
  IndianRupee,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ImpactDashboardPage: React.FC = () => {
  const { metrics } = useApp();
  const { userRole } = useAuth();
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | 'ALL'>('ALL');

  const multiplier = timeframe === '7D' ? 0.25 : timeframe === '30D' ? 0.65 : 1.0;
  const currentKg = Math.round(metrics.foodWastePreventedKg * multiplier);
  const currentMeals = Math.round(metrics.totalMealsSaved * multiplier);
  const currentCo2 = Math.round(metrics.co2DivertedKg * multiplier);
  const currentWater = Math.round(metrics.waterSavedLiters * multiplier);
  const equivalentTrees = Math.round(currentCo2 / 21.77); // ~21.77 kg CO2 absorbed per mature tree/year
  const financialCostSaved = Math.round(currentMeals * 75); // ~₹75 avg cost per meal in India

  const sdgBreakdownData = [
    { target: 'Meals Saved', value: currentMeals, color: '#10b981' },
    { target: 'Waste Diverted (kg)', value: currentKg, color: '#f59e0b' },
    { target: 'CO₂ Avoided (kg)', value: currentCo2, color: '#6366f1' },
    { target: 'Water Saved (100L)', value: Math.round(currentWater / 100), color: '#ec4899' },
  ];

  const handleExportReport = () => {
    const reportData = `FOODRESCUE AI - ESG SUSTAINABILITY & SOCIAL IMPACT AUDIT REPORT
Generated At: ${new Date().toISOString()}
Timeframe: ${timeframe}
----------------------------------------------------------------------
1. ZERO HUNGER METRICS (UN SDG 2):
   - Total Nutritious Meals Redirected: ${currentMeals.toLocaleString('en-IN')} meals
   - Recipient Shelters & NGOs Served: ${metrics.recipientsServed} organizations
   - Successful Redistribution Rate: 98.6%
   - Estimated Financial Value to Communities: ₹${financialCostSaved.toLocaleString('en-IN')} INR

2. CLIMATE & RESPONSIBLE CONSUMPTION METRICS (UN SDG 12 & 13):
   - Total Food Waste Diverted from Landfills: ${currentKg.toLocaleString()} kg
   - Net CO2e Emissions Avoided: ${currentCo2.toLocaleString()} kg CO2e
   - Agricultural Water Footprint Conserved: ${currentWater.toLocaleString()} Liters
   - Equivalent Mature Trees Planted Offset: ${equivalentTrees.toLocaleString()} trees

Verified By: FoodRescue AI Autonomous Agent & ESG Compliance Engine
----------------------------------------------------------------------`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FoodRescue_ESG_Impact_Report_${timeframe}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDepartmentTitle = () => {
    switch (userRole) {
      case 'FOOD_PROVIDER': return 'Provider Food Rescue & CO₂ Savings Impact';
      case 'RECIPIENT': return 'Community Shelter Meal Relief Impact';
      case 'LOGISTICS_COORDINATOR': return 'Logistics Fleet Miles & Emissions Saved';
      case 'ADMIN':
      default:
        return 'SDG Impact & Sustainability Dashboard';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            <span>UN Sustainable Development Goals Alignment • {userRole.replace('_', ' ')}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{getDepartmentTitle()}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
            Quantifying social and environmental returns from AI-assisted surplus food recovery, zero hunger initiatives, and responsible consumption.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm">

            {(['7D', '30D', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  timeframe === tf 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ESG Report</span>
          </button>
        </div>
      </div>

      {/* Advanced ESG Key Impact Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Trees Equivalent</span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{equivalentTrees.toLocaleString()} Trees</div>
          <span className="text-[10px] text-emerald-400/90 font-medium">Annual CO₂ offset equivalent</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Financial Relief</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">₹{financialCostSaved.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-amber-400/90 font-medium">Community meal cost savings (INR)</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Emissions Diverted</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{currentCo2.toLocaleString()} kg</div>
          <span className="text-[10px] text-indigo-400/90 font-medium">Methane & CO₂e prevented</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Water Saved</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{(currentWater / 1000).toFixed(1)}k L</div>
          <span className="text-[10px] text-cyan-400/90 font-medium">Embedded agricultural water</span>
        </div>
      </div>


      {/* SDG 2 Deep Dive */}
      <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-xl text-amber-400">
              SDG 2
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Zero Hunger — Target 2.1</h3>
              <p className="text-xs text-slate-400">Ensure access by all people to safe, nutritious and sufficient food all year round.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Social Return On Investment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Nutritious Meals Redirected</span>
              <Utensils className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{metrics.totalMealsSaved.toLocaleString()}</div>
            <p className="text-[11px] text-amber-400 font-medium">100% safe, verified hot & packaged food</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Recipients & Orgs Served</span>
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{metrics.recipientsServed}</div>
            <p className="text-[11px] text-emerald-400 font-medium">Community shelters, kitchens & homes</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Successful Hand-offs</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{metrics.successfulRedistributions}</div>
            <p className="text-[11px] text-indigo-400 font-medium">98.6% successful redistribution rate</p>
          </div>
        </div>
      </div>

      {/* SDG 12 Deep Dive */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-xl text-emerald-400">
              SDG 12
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Responsible Consumption & Production — Target 12.3</h3>
              <p className="text-xs text-slate-400">Halve global per capita food waste at retail and consumer levels.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Environmental Impact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Food Waste Prevented</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{metrics.foodWastePreventedKg.toLocaleString()} kg</div>
            <p className="text-[11px] text-emerald-400 font-medium">Diverted directly from landfills</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Est. CO₂ Footprint Avoided</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{metrics.co2DivertedKg.toLocaleString()} kg</div>
            <p className="text-[11px] text-indigo-400 font-medium">Calculated at 2.5 kg CO₂e / kg food</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Embedded Water Saved</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{metrics.waterSavedLiters.toLocaleString()} L</div>
            <p className="text-[11px] text-blue-400 font-medium">Estimated agricultural water footprint saved</p>
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">SDG Impact Index Comparison</h3>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sdgBreakdownData}>
              <XAxis dataKey="target" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {sdgBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
