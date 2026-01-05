import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Badge, Button, Card, Field, Input, Modal, Textarea } from '../components/UI'
import {
  createCheckin,
  deleteCheckin,
  fetchChallengesWithSchedules,
  fetchCheckinsForRange,
} from '../lib/api'
import { buildWeek, formatDate, weekDays } from '../lib/week'
import type { DayBucket, WeekTask } from '../lib/types'

const formatHumanDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })

const DashboardPage = ({ session }: { session: Session }) => {
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = useState<DayBucket[]>([])
  const [selectedTask, setSelectedTask] = useState<WeekTask | null>(null)
  const [valueInput, setValueInput] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const anchor = useMemo(() => new Date(), [])
  const weekRange = useMemo(() => {
    const days = weekDays(anchor)
    return { start: days[0], end: days[6] }
  }, [anchor])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [challengeData, checkinData] = await Promise.all([
        fetchChallengesWithSchedules(),
        fetchCheckinsForRange(weekRange.start, weekRange.end),
      ])
      const schedulesList = challengeData.flatMap((c) => c.challenge_schedules || [])
      setWeek(buildWeek(challengeData, schedulesList, checkinData, anchor))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const openValidation = (task: WeekTask) => {
    setSelectedTask(task)
    setValueInput(task.checkin?.value?.toString() ?? '')
    setNote(task.checkin?.note ?? '')
  }

  const closeModal = () => {
    setSelectedTask(null)
    setValueInput('')
    setNote('')
  }

  const handleSave = async () => {
    if (!selectedTask) return

    const payload: any = {
      user_id: session.user.id,
      challenge_id: selectedTask.challenge.id,
      check_date: selectedTask.dateKey,
      note: note || null,
    }

    if (selectedTask.challenge.type === 'binary') {
      payload.done = true
      payload.value = null
    } else {
      const numeric = Number(valueInput)
      if (Number.isNaN(numeric)) {
        setError('Entre une valeur numérique.')
        return
      }
      payload.value = numeric
      payload.done = null
    }

    try {
      await createCheckin(payload)
      closeModal()
      refresh()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUndo = async (checkinId?: string) => {
    if (!checkinId) return
    try {
      await deleteCheckin(checkinId)
      refresh()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const isWeekEmpty = week.every((day) => day.tasks.length === 0)

  return (
      <div className="page">
        {/* HEADER ENTIEREMENT SUPPRIMÉ */}

        {error && <p className="error">{error}</p>}
        {loading ? (
            <div className="loader-row">
              <div className="loader" />
              <p>Synchronisation...</p>
            </div>
        ) : (
            <div className="week-grid">
              {isWeekEmpty && <p className="muted">Aucun challenge planifié.</p>}

              {week
                  .filter((day) => day.tasks.length > 0)
                  .map((day) => (
                      <Card
                          key={day.date.toISOString()}
                          title={formatHumanDate(day.date)}
                          actions={
                            <Badge
                                tone={formatDate(new Date()) === formatDate(day.date) ? 'accent' : 'neutral'}
                            >
                              {day.tasks.length} tâche(s)
                            </Badge>
                          }
                          subdued
                      >
                        <div className="task-stack">
                          {day.tasks.map((task) => {
                            return (
                                <div
                                    key={task.challenge.id}
                                    className={`task ${task.checkin ? 'task-done' : ''}`}
                                >
                                  <div>
                                    <div className="task-top">
                                      <p className="task-title">{task.challenge.title}</p>
                                    </div>
                                    <p className="muted">
                                      {task.challenge.type === 'binary'
                                          ? 'Action unique'
                                          : `${task.challenge.unit ?? ''} objectif ${
                                              task.challenge.target_value ?? '-'
                                          }`}
                                    </p>
                                    {task.checkin && (
                                        <p className="muted small">
                                          Validé :{' '}
                                          {task.challenge.type === 'binary'
                                              ? 'Fait'
                                              : `${task.checkin.value ?? ''} ${task.challenge.unit ?? ''}`}{' '}
                                          {task.checkin.note && <> · {task.checkin.note}</>}
                                        </p>
                                    )}
                                  </div>
                                  <div className="task-actions">
                                    {task.checkin ? (
                                        <Button variant="ghost" onClick={() => handleUndo(task.checkin?.id)}>
                                          Undo
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => openValidation(task)}
                                            variant="primary"
                                        >
                                          Valider
                                        </Button>
                                    )}
                                  </div>
                                </div>
                            )
                          })}
                        </div>
                      </Card>
                  ))}
            </div>
        )}

        <Modal
            open={Boolean(selectedTask)}
            title={
              selectedTask
                  ? `Valider ${selectedTask.challenge.title} (${selectedTask.dateKey})`
                  : ''
            }
            onClose={closeModal}
            footer={
              <div className="modal-actions">
                <Button variant="ghost" onClick={closeModal}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>Enregistrer</Button>
              </div>
            }
        >
          {selectedTask && (
              <div className="stack">
                {selectedTask.challenge.type === 'binary' ? (
                    <p className="muted">Validation simple.</p>
                ) : (
                    <Field
                        label={
                          selectedTask.challenge.type === 'weight' ? 'Poids mesuré' : 'Valeur réalisée'
                        }
                        hint={selectedTask.challenge.unit ?? ''}
                    >
                      <Input
                          type="number"
                          step="0.1"
                          value={valueInput}
                          onChange={(e) => setValueInput(e.target.value)}
                          placeholder="0"
                      />
                    </Field>
                )}
                <Field label="Note">
                  <Textarea
                      rows={3}
                      placeholder="Commentaire..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
              </div>
          )}
        </Modal>
      </div>
  )
}

export default DashboardPage