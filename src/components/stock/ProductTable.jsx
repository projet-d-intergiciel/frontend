import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ProductTable = ({ products, onMovementClick }) => {
  const columns = [
    { label: 'PRODUIT', key: 'name' },
    { label: 'STOCK DISPONIBLE', key: 'stock', render: (row) => `${row.stock.toLocaleString()} unités` },
    { label: 'SEUIL MIN', key: 'seuilMin' },
    { 
      label: 'STATUT', 
      key: 'statut', 
      render: (row) => <Badge status={row.statut}>{row.statut}</Badge>
    },
    { 
      label: 'ACTION', 
      key: 'action', 
      render: (row) => (
        <Button variant="outline" onClick={() => onMovementClick(row)}>
          Mouvement
        </Button>
      )
    }
  ];

  return <Table columns={columns} data={products} />;
};

export default ProductTable;