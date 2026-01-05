import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import ChallengeForm from '../components/ChallengeForm'
import { Badge, Button, Card, Modal } from '../components/UI'
import {
  createChallengeWithSchedule,
  deleteChallenge,
  fetchChallengesWithSchedules,
  updateChallengeWithSchedule,
} from '../lib/api'
import type { ChallengeFormValues } from '../lib/api'
import type { ChallengeSchedule, ChallengeWithSchedule } from '../lib/types'

const asFormValues = (
  challenge: ChallengeWithSchedule,
  schedule?: ChallengeSchedule | null,
): ChallengeFormValues => ({
  title: challenge.title,
  description: challenge.description ?? '',
  type: challenge.type,
  unit: challenge.unit ?? '',
  target_value: challenge.target_value,
  start_date: challenge.start_date,
  end_date: challenge.end_date,
  is_active: challenge.is_active,
  frequency: schedule?.frequency ?? 'daily',
  weekly_days: schedule?.weekly_days ?? [],
  monthly_rule: schedule?.monthly_rule ?? 'first_day',
})

const ChallengesPage = ({ session }: { session: Session }) => {
  const [challenges, setChallenges] = useState<ChallengeWithSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ChallengeWithSchedule | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const navigate = useNavigate()

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchChallengesWithSchedules()
      setChallenges(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleSubmit = async (values: ChallengeFormValues) => {
    if (mode === 'create') {
      await createChallengeWithSchedule(session.user.id, values)
    } else if (editing) {
      const schedule = editing.challenge_schedules[0] ?? null
      await updateChallengeWithSchedule(session.user.id, editing, schedule, values)
    }
    setModalOpen(false)
    setEditing(null)
    refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce challenge ?')) return
    await deleteChallenge(id)
    refresh()
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Gestion des challenges</p>
          <h2>Crée, ajuste, supprime</h2>
        </div>
        <Button
          onClick={() => {
            setMode('create')
            setEditing(null)
            setModalOpen(true)
          }}
        >
          Nouveau challenge
        </Button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <div className="loader-row">
          <div className="loader" />
          <p>Chargement...</p>
        </div>
      ) : (
        <div className="list">
          {challenges.map((challenge) => {
            const schedule = challenge.challenge_schedules[0]
            return (
              <Card
                key={challenge.id}
                title={challenge.title}
                actions={
                  <div className="chip-row">
                    <Badge tone={challenge.is_active ? 'accent' : 'neutral'}>
                      {challenge.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge tone="neutral">{challenge.type}</Badge>
                    {schedule && <Badge tone="neutral">{schedule.frequency}</Badge>}
                  </div>
                }
              >
                <p className="muted">{challenge.description || 'Pas de description'}</p>
                <div className="meta-row">
                  <span>
                    Objectif:{' '}
                    {challenge.type === 'binary'
                      ? 'Faire / ne pas faire'
                      : `${challenge.target_value ?? ''} ${challenge.unit ?? ''}`}
                  </span>
                  <span>
                    Période: {challenge.start_date} → {challenge.end_date}
                  </span>
                </div>
                <div className="actions">
                  <Button variant="ghost" onClick={() => navigate(`/challenges/${challenge.id}`)}>
                    Détails
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(challenge)
                      setMode('edit')
                      setModalOpen(true)
                    }}
                  >
                    Modifier
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(challenge.id)}>
                    Supprimer
                  </Button>
                </div>
              </Card>
            )
          })}
          {challenges.length === 0 && <p className="muted">Aucun challenge pour l'instant.</p>}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Nouveau challenge' : 'Modifier le challenge'}
      >
        <ChallengeForm
          initial={editing ? asFormValues(editing, editing.challenge_schedules[0]) : undefined}
          schedule={editing?.challenge_schedules[0]}
          onSubmit={handleSubmit}
          submitLabel={mode === 'create' ? 'Créer' : 'Mettre à jour'}
          onCancel={() => {
            setModalOpen(false)
            setEditing(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default ChallengesPage
