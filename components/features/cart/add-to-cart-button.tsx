// 🎨 CLIENT COMPONENT
// Interactivité, hooks, state management
// Nécessite 'use client' directive

'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import type { Product } from '@prisma/client';

interface AddToCartButtonProps {
  product: Pick<Product, 'id' | 'name' | 'price' | 'slug' | 'images'>;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      slug: product.slug,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={added}
      className="w-full"
      size="lg"
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </>
      )}
    </Button>
  );
}
