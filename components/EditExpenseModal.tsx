'use client'
import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

type Props = {
  show: boolean
  onHide: () => void
  expense: any | null
}

export default function EditExpenseModal({ show, onHide, expense }: Props) {
  const [descripcion, setDescripcion] = useState('')
  const [total, setTotal] = useState('')
  const [pagadoAlec, setPagadoAlec] = useState('')
  const [pagadoMario, setPagadoMario] = useState('')
  const [saving, setSaving] = useState(false)

  // 🔹 Cargar los valores del gasto cuando se abre el modal
  useEffect(() => {
    if (expense) {
      setDescripcion(expense.description || '')
      setTotal(expense.total?.toString() || '')
      setPagadoAlec(expense.pagadoAlec?.toString() || '')
      setPagadoMario(expense.pagadoMario?.toString() || '')
    }
  }, [expense])

  const handleGuardar = async () => {
    if (!expense) return
    const totalNum = Number(total)
    const alecNum = Number(pagadoAlec)
    const marioNum = Number(pagadoMario)
    if (!descripcion.trim()) return alert('Añade una descripción.')
    if (isNaN(totalNum) || totalNum <= 0) return alert('Total inválido.')
    if (Math.abs(alecNum + marioNum - totalNum) > 0.01)
      return alert('La suma de ambos pagos no coincide con el total.')

    try {
      setSaving(true)
      const ref = doc(db, 'expenses', expense.id)
      await updateDoc(ref, {
        description: descripcion.trim(),
        total: totalNum,
        pagadoAlec: alecNum,
        pagadoMario: marioNum,
        updatedAt: new Date()
      })
      onHide()
    } catch (err: any) {
      console.error(err)
      alert('Error al guardar cambios: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    if (!expense) return
    const confirmar = confirm('¿Seguro que deseas eliminar este gasto?')
    if (!confirmar) return
    try {
      await deleteDoc(doc(db, 'expenses', expense.id))
      onHide()
    } catch (err: any) {
      console.error(err)
      alert('Error al eliminar: ' + err.message)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title className="text-white">Editar gasto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Descripción</Form.Label>
            <Form.Control
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-white">Total (€)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <div className="row">
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label className="text-white">Alejandro</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={pagadoAlec}
                  onChange={(e) => setPagadoAlec(e.target.value)}
                  disabled={saving}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label className="text-white">Mario</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={pagadoMario}
                  onChange={(e) => setPagadoMario(e.target.value)}
                  disabled={saving}
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={handleEliminar} disabled={saving}>
          Eliminar
        </Button>
        <div>
          <Button variant="secondary" onClick={onHide} disabled={saving} className="me-2">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
