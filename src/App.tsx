import { useState } from 'react';
import { 
  Trophy, Menu, Wallet, ArrowDownToLine, Coins, Users,
  Pencil, Trash2, Plus, LayoutGrid, Shield, X
} from 'lucide-react';
import './index.css';

const MAX_SQUAD_SIZE = 11;

type Role = 'Batter' | 'Bowler' | 'All Rounder' | 'Wicket Keeper';

type Slot = {
  id: number;
  isFilled: boolean;
  name?: string;
  role?: Role;
  amount?: number;
};

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [purseInput, setPurseInput] = useState('');
  const [totalPurse, setTotalPurse] = useState(0);

  // Dynamic state for slots
  const initialSlots: Slot[] = Array.from({ length: MAX_SQUAD_SIZE }, (_, i) => ({ id: i + 1, isFilled: false }));
  const [slots, setSlots] = useState<Slot[]>(initialSlots);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalRole, setModalRole] = useState<Role>('Batter');
  const [modalAmount, setModalAmount] = useState('');

  // Computed Values
  const amountSpent = slots.reduce((sum, slot) => sum + (slot.amount || 0), 0);
  const remainingBalance = Math.max(0, totalPurse - amountSpent);
  const currentPlayers = slots.filter(s => s.isFilled).length;
  const playersNeeded = MAX_SQUAD_SIZE - currentPlayers;

  // Clamped percentages
  const spentPercent = totalPurse > 0 ? Math.min(100, Math.max(0, (amountSpent / totalPurse) * 100)) : 0;
  const remainingPercent = totalPurse > 0 ? Math.min(100, Math.max(0, (remainingBalance / totalPurse) * 100)) : 0;

  const handleStart = () => {
    const purseVal = parseInt(purseInput.replace(/\D/g, ''));
    if (!isNaN(purseVal) && purseVal > 0) {
      setTotalPurse(purseVal);
      setHasStarted(true);
    }
  };

  const openModal = (slotId?: number) => {
    if (slotId) {
      // Edit mode
      const slot = slots.find(s => s.id === slotId);
      if (slot && slot.isFilled) {
        setEditingSlotId(slotId);
        setModalName(slot.name || '');
        setModalRole(slot.role || 'Batter');
        setModalAmount(slot.amount ? slot.amount.toString() : '');
        setIsModalOpen(true);
      } else if (slot && !slot.isFilled) {
        // Adding to specific empty slot
        setEditingSlotId(slotId);
        setModalName('');
        setModalRole('Batter');
        setModalAmount('');
        setIsModalOpen(true);
      }
    } else {
      // Global Add
      const emptySlotIndex = slots.findIndex(s => !s.isFilled);
      if (emptySlotIndex === -1) {
        alert("Squad is completely full!");
        return;
      }
      setEditingSlotId(slots[emptySlotIndex].id);
      setModalName('');
      setModalRole('Batter');
      setModalAmount('');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlotId(null);
  };

  const savePlayer = () => {
    if (!modalName.trim()) {
      alert("Please enter the player's name.");
      return;
    }
    if (!modalAmount) {
      alert("Please enter the amount spent.");
      return;
    }
    const amountVal = parseInt(modalAmount.replace(/\D/g, ''), 10);
    if (isNaN(amountVal) || amountVal < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (editingSlotId) {
      // Check budget if we are not just editing
      const slot = slots.find(s => s.id === editingSlotId);
      const previousAmount = slot?.amount || 0;
      const amountDifference = amountVal - previousAmount;
      
      if (amountDifference > remainingBalance) {
        const confirm = window.confirm("This exceeds your remaining purse! Proceed anyway?");
        if (!confirm) return;
      }

      const newSlots = slots.map(s => {
        if (s.id === editingSlotId) {
          return { ...s, isFilled: true, name: modalName, role: modalRole, amount: amountVal };
        }
        return s;
      });
      setSlots(newSlots);
    }
    closeModal();
  };

  const removePlayer = (id: number) => {
    const confirm = window.confirm("Remove player from squad?");
    if (!confirm) return;
    const newSlots = slots.map(s => s.id === id ? { id, isFilled: false } : s);
    setSlots(newSlots);
  };

  const getCount = (roleMatch: string) => slots.filter(s => s.isFilled && s.role?.toLowerCase() === roleMatch.toLowerCase()).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3
    }).format(val);
  };

  if (!hasStarted) {
    return (
      <div className="app-container flex flex-col justify-center min-h-[100vh] pb-20">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Team Tracker</h1>
          <p className="text-purple-400 font-medium">Setup live auction</p>
        </div>

        <div className="glass-card p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                Total Team Purse (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-white text-lg font-bold focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="e.g. 10,00,00,000"
                  value={purseInput}
                  onChange={(e) => setPurseInput(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="btn-primary mt-4 py-4 text-lg"
              onClick={handleStart}
              disabled={!purseInput}
            >
              Start Tracking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Team Tracker</h1>
            <p className="text-xs text-green-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Live Session
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-md bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-gray-300">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Total Purse */}
        <div className="glass-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-500/20 p-1.5 rounded-md text-purple-400">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Purse</span>
          </div>
          <span className="text-lg font-bold text-white">{formatCurrency(totalPurse)}</span>
        </div>

        {/* Players Needed */}
        <div className="glass-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-yellow-500/20 p-1.5 rounded-md text-yellow-500">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Needed</span>
          </div>
          <span className="text-lg font-bold text-yellow-500">{playersNeeded} <span className="text-sm font-normal text-gray-400">/ 11</span></span>
        </div>

        {/* Spent */}
        <div className="glass-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-500/20 p-1.5 rounded-md text-red-400">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent</span>
          </div>
          <span className="text-lg font-bold text-red-400">{formatCurrency(amountSpent)}</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${spentPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="glass-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-500/20 p-1.5 rounded-md text-green-400">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</span>
          </div>
          <span className="text-lg font-bold text-green-400">
            {formatCurrency(remainingBalance)}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${remainingPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Squad Card */}
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            Current Squad <span className="text-purple-400 font-semibold text-sm">({currentPlayers}/11)</span>
          </h2>
        </div>

        {/* Slots List */}
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-3 py-3 px-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              {/* Slot Number */}
              <div className="w-8 h-8 shrink-0 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold flex items-center justify-center border border-purple-500/20">
                {slot.id}
              </div>

              {/* Middle Section (Name + Role) */}
              <div className="flex-1 min-w-0">
                {slot.isFilled ? (
                  <>
                    <div className="text-sm font-bold text-white truncate">{slot.name}</div>
                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                      {slot.role}
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-medium text-gray-600 italic">Empty Slot</div>
                )}
              </div>

              {/* Amount & Actions */}
              {slot.isFilled ? (
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="text-sm font-bold text-gray-300">
                    {slot.amount ? formatCurrency(slot.amount) : '₹0'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openModal(slot.id)}
                      className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => removePlayer(slot.id)}
                      className="w-7 h-7 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shrink-0">
                  <button 
                    onClick={() => openModal(slot.id)}
                    className="w-10 h-10 rounded-full border border-purple-500/30 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 transition-colors border-dashed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Squad Composition (Now Full Width) */}
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Squad Roles</h3>
          <div className="text-[10px] text-gray-400 font-semibold">{currentPlayers} Filled</div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <CompositionRow label="Batter" current={getCount('batter')} total={4} color="bg-yellow-500" iconColor="text-yellow-500" />
          <CompositionRow label="Bowler" current={getCount('bowler')} total={4} color="bg-blue-500" iconColor="text-blue-500" />
          <CompositionRow label="All Rounder" current={getCount('all rounder')} total={2} color="bg-green-500" iconColor="text-green-500" />
          <CompositionRow label="Wicket Keeper" current={getCount('wicket keeper')} total={1} color="bg-pink-500" iconColor="text-pink-500" />
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <nav className="bottom-nav">
        <div className="nav-item">
          <LayoutGrid className="w-5 h-5" />
          <span>Dashboard</span>
        </div>
        <div className="nav-item-center shadow-[0_0_20px_rgba(112,0,255,0.4)]" onClick={() => openModal()}>
          <Plus className="w-7 h-7" />
        </div>
        <div className="nav-item">
          <Shield className="w-5 h-5" />
          <span>Squad</span>
        </div>
      </nav>

      {/* Add / Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-card w-full sm:max-w-md p-6 sm:p-8 border-t border-purple-500/40 sm:border rounded-t-[2.5rem] sm:rounded-[2rem] relative shadow-[0_-20px_50px_rgba(112,0,255,0.15)] sm:shadow-[0_0_50px_rgba(112,0,255,0.2)] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-8 pr-10">
              <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                {slots.find(s => s.id === editingSlotId)?.isFilled ? 'Edit Player' : 'Add Player'}
              </h2>
              <p className="text-xs font-medium text-purple-400">
                {slots.find(s => s.id === editingSlotId)?.isFilled ? 'Update squad member details' : 'Add purchased player to your squad'}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Player Name
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white text-lg font-semibold placeholder:text-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter player name"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-white text-lg font-semibold focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value as Role)}
                  >
                    <option value="Batter">Batter</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All Rounder">All Rounder</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Amount Spent (₹)
                </label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white text-lg font-semibold placeholder:text-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter amount spent"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                />
              </div>

              <div className="pt-4 pb-2">
                <button 
                  onClick={savePlayer}
                  className="btn-primary w-full py-4 text-lg font-bold shadow-[0_0_30px_rgba(112,0,255,0.3)] hover:shadow-[0_0_40px_rgba(112,0,255,0.5)] transition-all"
                >
                  {slots.find(s => s.id === editingSlotId)?.isFilled ? 'Update Player' : 'Add To Squad'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompositionRow({ label, current, total, color, iconColor }: { label: string, current: number, total: number, color: string, iconColor: string }) {
  const percentage = Math.min(100, (current / total) * 100);
  
  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full bg-gray-800 flex items-center justify-center ${iconColor}`}>
             <span className="text-[8px] font-bold">X</span>
          </div>
          <span className="text-[10px] text-gray-300 font-medium">{label}</span>
        </div>
        <span className="text-[10px] text-gray-500">{current}/{total}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden w-full">
        <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
