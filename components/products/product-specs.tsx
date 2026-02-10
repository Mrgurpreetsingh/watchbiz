/**
 * 📋 Product Specs - Spécifications techniques produit
 *
 * Features:
 * - Table 2 colonnes (Label/Valeur)
 * - Parse specifications JSON
 * - Style : borders subtiles, font Inter Regular
 * - Champs standards : mouvement, calibre, étanchéité, matériau, diamètre, verre
 */

interface ProductSpecsProps {
  specifications?: Record<string, string> | null
}

export function ProductSpecs({ specifications }: ProductSpecsProps) {
  // Si pas de specs, ne rien afficher
  if (!specifications || Object.keys(specifications).length === 0) {
    return null
  }

  // Mapping des clés vers labels français
  const labelMap: Record<string, string> = {
    movement: 'Mouvement',
    caliber: 'Calibre',
    waterResistance: 'Étanchéité',
    material: 'Matériau',
    diameter: 'Diamètre',
    glass: 'Verre',
    bracelet: 'Bracelet',
    powerReserve: 'Réserve de marche',
    caseMaterial: 'Matériau du boîtier',
    dialColor: 'Couleur du cadran',
    warranty: 'Garantie',
  }

  // Convertir l'objet en tableau de paires [label, value]
  const specs = Object.entries(specifications)
    .map(([key, value]) => ({
      label: labelMap[key] || key,
      value: value,
    }))
    .filter((spec) => spec.value) // Enlever les valeurs vides

  if (specs.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 font-heading text-2xl font-semibold text-luxury-black">
        Spécifications Techniques
      </h2>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <table className="w-full">
          <tbody>
            {specs.map((spec, index) => (
              <tr
                key={index}
                className={`border-b border-border last:border-0 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-light/30'
                }`}
              >
                <td className="w-1/3 px-6 py-4 font-semibold text-luxury-black">
                  {spec.label}
                </td>
                <td className="px-6 py-4 text-slate-premium">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <p className="mt-4 text-sm text-slate-mid">
        Les spécifications peuvent varier légèrement selon les versions du produit.
        Contactez-nous pour plus d'informations.
      </p>
    </div>
  )
}
