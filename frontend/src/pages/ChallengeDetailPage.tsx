import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card } from '../components/UI'
import { fetchChallengeById, fetchCheckinsForChallenge } from '../lib/api'
import type { ChallengeSchedule, ChallengeWithSchedule, Checkin } from '../lib/types'

const weekLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const ChallengeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState<ChallengeWithSchedule | null>(null)
  const [schedule, setSchedule] = useState<ChallengeSchedule | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!id) return
    setError(null)
    try {
      const data = await fetchChallengeById(id)
      setChallenge(data)
      setSchedule(data.challenge_schedules?.[0] ?? null)
      const checkinList = await fetchCheckinsForChallenge(id)
      setCheckins(checkinList)
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const progress = useMemo(() => {
    if (!challenge) return null
    if (challenge.type === 'binary') {
      const done = checkins.length
      return { label: 'Jours validés', value: `${done} check-in(s)` }
    }
    if (challenge.type === 'quantitative') {
      const sum = checkins.reduce((acc, c) => acc + (c.value ?? 0), 0)
      return { label: 'Progression cumulée', value: `${sum} ${challenge.unit ?? ''}` }
    }
    if (challenge.type === 'weight') {
      const latest = [...checkins].sort(
        (a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime(),
      )[0]
      return {
        label: 'Dernier poids',
        value: latest ? `${latest.value ?? ''} ${challenge.unit ?? ''}` : 'Aucun relevé',
      }
    }
    return null
  }, [challenge, checkins])

  if (!id) return <p className="error">Aucun challenge indiqué.</p>

  if (!challenge) {
    return (
      <div className="page">
        <div className="loader-row">
          <div className="loader" />
          <p>Chargement du challenge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Challenge</p>
          <h2>{challenge.title}</h2>
          <p className="muted">{challenge.description || 'Pas de description'}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="grid two">
        <Card title="Informations">
          <div className="chip-row">
            <Badge tone="neutral">{challenge.type}</Badge>
            <Badge tone={challenge.is_active ? 'accent' : 'neutral'}>
              {challenge.is_active ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          <p className="muted">
            Période : {challenge.start_date} → {challenge.end_date}
          </p>
          <p className="muted">
            Objectif :{' '}
            {challenge.type === 'binary'
              ? 'Faire / ne pas faire'
              : `${challenge.target_value ?? ''} ${challenge.unit ?? ''}`}
          </p>
          {progress && (
            <div className="stat">
              <p className="eyebrow">{progress.label}</p>
              <p className="kpi">{progress.value}</p>
            </div>
          )}
        </Card>

        <Card title="Planning">
          {schedule ? (
            <div className="stack">
              <p className="muted">Fréquence : {schedule.frequency}</p>
              {schedule.frequency === 'weekly' && (
                <p className="muted">
                  Jours : {schedule.weekly_days?.map((d) => weekLabels[d]).join(', ') || '—'}
                </p>
              )}
              {schedule.frequency === 'monthly' && (
                <p className="muted">Mensuel : le 1er du mois</p>
              )}
            </div>
          ) : (
            <p className="muted">Pas de planning associé.</p>
          )}
        </Card>
      </div>

      <Card title="Historique des check-ins">
        {checkins.length === 0 ? (
          <p className="muted">Aucune validation pour l'instant.</p>
        ) : (
          <div className="list">
            {checkins.map((c) => (
              <div key={c.id} className="history-row">
                <div>
                  <p className="task-title">{c.check_date}</p>
                  <p className="muted small">{c.note || '—'}</p>
                </div>
                <div className="chip-row">
                  {challenge.type === 'binary' ? (
                    <Badge tone="accent">Fait</Badge>
                  ) : (
                    <Badge tone="accent">
                      {c.value} {challenge.unit}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default ChallengeDetailPage
