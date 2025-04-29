import React, { useState } from 'react';

export const SupplierManager = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const suppliers = [
    {
      id: 1,
      name: 'John Doe',
      items: [{ id: 1, name: 'Arabic Beans', quantity: 123, units: 'Grams', price: '$1' }],
    },
    {
      id: 2,
      name: 'Alice Smith',
      items: [{ id: 2, name: 'Robusta Beans', quantity: 123, units: 'Grams', price: '$1' }],
    },
    {
      id: 3,
      name: 'Alex Wang',
      items: [{ id: 3, name: 'Liberia Beans', quantity: 123, units: 'Grams', price: '$1' }],
    },
  ];

  const filteredSuppliers = suppliers.map(supplier => ({
    ...supplier,
    items: supplier.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />
      </div>

      {filteredSuppliers.map((supplier) => (
        <div key={supplier.id} style={{ marginBottom: '30px' }}>
          <div style = {styles.supplierHeader}>
            <h3 style = {styles.supplierName}> {supplier.name}</h3>
            <div style = {styles.actions}>...</div>
            </div>
          <table style={styles.table}>
            <thead style={styles.borderTopBottom}>
              <tr>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Units</th>
                <th style={styles.tableHeader}>Price</th>
              </tr>
            </thead>
              {supplier.items.length === 0 ? (
                <tr><td colSpan="4">No items found</td></tr>
              ) : (
                supplier.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.units}</td>
                    <td>{item.price}</td>
                  </tr>
                ))
              )}
          </table>
        </div>
      ))}
    </div>
  );
};

const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    controls: {
      marginBottom: '20px',
    },
    search: {
      padding: '8px',
      width: '200px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
    },
    borderTopBottom: {
      borderTop: '2px solid #000',
      borderBottom: '2px solid #000',
    },
    supplierHeader: {
      display: 'flex',
      justifyContent: 'space-between',  
      alignItems: 'center',
      marginBottom: '10px',
      fontWeight: 'normal',
    },
    tableHeader: {
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '10px 5px',
    },
    supplierName: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'normal',
    },
    actions: {
      fontSize: '24px',
      cursor: 'pointer',
      paddingLeft: '10px',
      fontWeight: 'normal',
    },
};