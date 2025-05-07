import React, { useState } from 'react';
import { SuppliersCollection } from '../api/suppliers/SuppliersCollection';

export const SupplierForm = () => {
    const [abn, setAbn] = useState('');
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [productsSupplied, setProductsSupplied] = useState([]);
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!abn) return;

        await Meteor.callAsync("suppliers.insert", {
            abn: abn.trim(),
            name: name.trim(),
            contactPerson: contactPerson.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            productsSupplied: productsSupplied,
            notes: notes,
        });

        setAbn("");
        setName("");   
        setContactPerson("");
        setEmail("");
        setPhone("");
        setAddress("");
        setProductsSupplied([]);
        setNotes(""); 

    }
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>ABN:</label>
                <input type="text" value={abn} onChange={(e) => setAbn(e.target.value)} required />
            </div>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Contact Person:</label>
                <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
            </div>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label>Phone:</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
                <label>Address:</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div>
                <label>Products Supplied:</label>
                <input type="text" value={productsSupplied.join(', ')} onChange={(e) => setProductsSupplied(e.target.value.split(',').map(item => item.trim()))} required />
            </div>
            <div>
                <label>Notes:</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>
            <button type="submit">Add Supplier</button>
        </form>
    )
}
