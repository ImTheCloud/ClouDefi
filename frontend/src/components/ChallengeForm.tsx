import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { ChallengeSchedule } from '../lib/types'
import type { ChallengeFormValues } from '../lib/api'
import { Button, Field, Input, Select, Textarea } from './UI'
import { formatDate } from '../lib/week'

const defaultForm = (): ChallengeFormValues => {
  const today = formatDate(new Date())
  const inThirty = new Date()
  inThirty.setDate(inThirty.getDate() + 30)

  return {
    title: '',
    description: '',
    type: 'quantitative',
    unit: 'km',
    target_value: 0,
    start_date: today,
    end_date: formatDate(inThirty),
    is_active: true,
    frequency: 'daily',
    weekly_days: [0],
    monthly_rule: 'first_day',
  }
}

const weekLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const ChallengeForm = ({
  initial,
  schedule,
  onSubmit,
  submitLabel = 'Enregistrer',
  onCancel,
}: {
  initial?: ChallengeFormValues
  schedule?: ChallengeSchedule | null
  submitLabel?: string
  onSubmit: (values: ChallengeFormValues) => Promise<void> | void
  onCancel?: () => void
}) => {
  const [form, setForm] = useState<ChallengeFormValues>(initial ?? defaultForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) setForm(initial)
    if (schedule) {
      setForm((prev) => ({
        ...prev,
        frequency: schedule.frequency,
        weekly_days: schedule.weekly_days ?? [],
        monthly_rule: schedule.monthly_rule ?? 'first_day',
      }))
    }
  }, [initial, schedule])

  const update = <K extends keyof ChallengeFormValues>(key: K, value: ChallengeFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleWeeklyDay = (dayIndex: number) => {
    setForm((prev) => {
      const set = new Set(prev.weekly_days)
      if (set.has(dayIndex)) set.delete(dayIndex)
      else set.add(dayIndex)
      return { ...prev, weekly_days: Array.from(set).sort() }
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(form)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isBinary = form.type === 'binary'
  const isWeight = form.type === 'weight'

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="grid two">
        <Field label="Titre">
          <Input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Ex: Courir 200 km"
          />
        </Field>
        <Field label="Type">
          <Select
            value={form.type}
            onChange={(e) => update('type', e.target.value as ChallengeFormValues['type'])}
          >
            <option value="quantitative">Quantitatif</option>
            <option value="binary">Binaire</option>
            <option value="weight">Poids</option>
          </Select>
        </Field>
      </div>

      <Field label="Description (optionnel)">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Pourquoi ce challenge ?"
        />
      </Field>

      {!isBinary && (
        <div className="grid two">
          <Field label="Unité">
            <Input
              required
              value={form.unit}
              onChange={(e) => update('unit', e.target.value)}
              placeholder={isWeight ? 'kg' : 'km / pages / sessions'}
            />
          </Field>
          <Field label="Objectif">
            <Input
              required
              type="number"
              step="0.1"
              value={form.target_value ?? ''}
              onChange={(e) => update('target_value', Number(e.target.value))}
              placeholder="0"
            />
          </Field>
        </div>
      )}

      <div className="grid two">
        <Field label="Début">
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
            required
          />
        </Field>
        <Field label="Fin">
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => update('end_date', e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="Fréquence">
        <div className="pill-group">
          {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              className={`pill-btn ${form.frequency === freq ? 'active' : ''}`}
              onClick={() => update('frequency', freq)}
            >
              {freq === 'daily' && 'Quotidien'}
              {freq === 'weekly' && 'Hebdomadaire'}
              {freq === 'monthly' && 'Mensuel'}
            </button>
          ))}
        </div>
      </Field>

      {form.frequency === 'weekly' && (
        <Field label="Jours de la semaine" hint="Multi-sélection">
          <div className="week-picker">
            {weekLabels.map((label, idx) => (
              <button
                type="button"
                key={label}
                className={form.weekly_days.includes(idx) ? 'day active' : 'day'}
                onClick={() => toggleWeeklyDay(idx)}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {form.frequency === 'monthly' && (
        <Field label="Règle mensuelle">
          <p className="muted">Simple: validation le 1er jour du mois.</p>
        </Field>
      )}

      <div className="form-footer">
        {error && <p className="error">{error}</p>}
        <div className="actions">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? '... ' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default ChallengeForm
