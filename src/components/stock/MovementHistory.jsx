import Table from '../common/Table';
import Badge from '../common/Badge';

const MovementHistory = ({ movements }) => {
  const columns = [
    { label: 'PRODUIT', key: 'product' },
    { 
      label: 'TYPE', 
      key: 'type', 
      render: (row) => <Badge status={row.type}>{row.type}</Badge>
    },
    { 
      label: 'QUANTITÉ', 
      key: 'quantity', 
      render: (row) => row.type === 'ENTRÉE' ? `+${row.quantity}` : `-${row.quantity}`
    },
    { label: 'MOTIF', key: 'motif' },
    { label: 'DATE', key: 'date' },
    { label: 'AUTEUR', key: 'author' }
  ];

  return <Table columns={columns} data={movements} />;
};

export default MovementHistory;