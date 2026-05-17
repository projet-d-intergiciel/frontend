import { useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const MovementForm = ({ products, onSubmit, onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementType, setMovementType] = useState('ENTRÉE');
  const [quantity, setQuantity] = useState('');
  const [motif, setMotif] = useState('');

  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (Stock: ${p.stock})` }));
  const typeOptions = [
    { value: 'ENTRÉE', label: 'ENTRÉE' },
    { value: 'SORTIE', label: 'SORTIE' },
    { value: 'AJUSTEMENT', label: 'AJUSTEMENT' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      productId: selectedProduct,
      type: movementType,
      quantity: parseInt(quantity),
      motif
    });
  };

  return (
    <Card title="Enregistrer un mouvement" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Produit"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          options={productOptions}
          required
        />
        <Select
          label="Type de mouvement"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          options={typeOptions}
          required
        />
        <Input
          label="Quantité"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          placeholder="0"
        />
        <Input
          label="Motif"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          required
          placeholder="Description du mouvement..."
        />
        <div className="flex gap-3">
          <Button type="submit" variant="primary">Enregistrer</Button>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        </div>
      </form>
    </Card>
  );
};

export default MovementForm;