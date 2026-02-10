'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { exportOrdersCSV } from '@/actions/admin-export'

/**
 * 📊 Bouton Export CSV Commandes
 *
 * Télécharge un fichier CSV de toutes les commandes
 * Compatible Excel (UTF-8 BOM)
 */
export function ExportCSVButton() {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      const result = await exportOrdersCSV()

      if (!result.success || !result.data) {
        alert(result.error || 'Erreur lors de l\'export')
        return
      }

      // Créer un Blob avec le CSV
      const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Nom du fichier avec date
      const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      link.download = `commandes-watchbiz-${date}.csv`

      // Déclencher le téléchargement
      document.body.appendChild(link)
      link.click()

      // Nettoyage
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Une erreur est survenue lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="default"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Export en cours...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exporter CSV
        </>
      )}
    </Button>
  )
}
