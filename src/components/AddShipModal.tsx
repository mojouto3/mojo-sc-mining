import { useState } from 'react'
import { X, Ship } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Btn, Combobox } from '@/components/ui'
import type { ShipType } from '@/types'

const SHIP_MODELS: { model: string; type: ShipType }[] = [
  { model: 'Anvil C8X Pisces',      type: 'scout' },
  { model: 'RSI Mantis',            type: 'scout' },
  { model: 'Drake Vulture',         type: 'scout' },
  { model: 'MISC Prospector',       type: 'mining' },
  { model: 'ARGO MOLE',             type: 'mining' },
  { model: 'RSI Arrastra',          type: 'mining' },
  { model: 'Greycat ROC',           type: 'mining' },
  { model: 'Hull C',                type: 'raw_hauler' },
  { model: 'C2 Hercules',           type: 'raw_hauler' },
  { model: 'Misc Freelancer MAX',   type: 'raw_hauler' },
  { model: 'Drake Caterpillar',     type: 'refine_hauler' },
  { model: 'Crusader M2 Hercules',  type: 'refine_hauler' },
]

const TYPE_LABELS: Record<ShipType, string> = {
  scout:         'Scout',
  mining:        'Mining',
  raw_hauler:    'Raw Hauler',
  refine_hauler: 'Refine Hauler',
}

interface Props {
  onClose: () => void
  currentPlayerId: string
}

export function AddShipModal({ onClose, currentPlayerId }: Props) {
  const addShip = useMojoStore((s) => s.addShip)
  const [model, setModel]       = useState(SHIP_MODELS[3].model)
  const [location, setLocation] = useState('')

  const selectedModel = SHIP_MODELS.find((m) => m.model === model) ?? SHIP_MODELS[3]

  function handleSubmit() {
    addShip({
      name:     selectedModel.model,
      model:    selectedModel.model,
      type:     selectedModel.type,
      status:   'active',
      location: location.trim() || 'Unknown',
    } as any, currentPlayerId)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Ship className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Add Ship</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Ship model</label>
            <Combobox
              value={model}
              onChange={setModel}
              placeholder="Select ship model..."
              options={SHIP_MODELS.map((m) => ({
                value: m.model,
                label: m.model,
                group: TYPE_LABELS[m.type],
              }))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
              Current location <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="text"
              placeholder='e.g. "Lyria OM-1"'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 placeholder-slate-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-800">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit}>Add ship</Btn>
        </div>
      </div>
    </div>
  )
}
