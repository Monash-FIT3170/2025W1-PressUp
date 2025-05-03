import React, { useState } from 'react';
import './SupplierForm.css';
import { SuppliersCollection } from '../../../api/suppliers/SuppliersCollection';

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
        // Insert supplier data into the database (Meteor call)
        await Meteor.callAsync("suppliers.insert", {
            abn: abn.trim(),
            active: true,
            name: name.trim(),
            contactPerson: contactPerson.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            productsSupplied: productsSupplied,
            notes: notes,
        });

        // Reset form fields after submit
        setAbn("");
        setName("");   
        setContactPerson("");
        setEmail("");
        setPhone("");
        setAddress("");
        setProductsSupplied([]);
        setNotes(""); 

        // Close the modal after submit
        onclose();

    }
    return (
        <div className="w-[557px] p-5 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-5 overflow-hidden">
            <div className="self-stretch h-7 flex flex-col justify-start items-start gap-2.5">
                <div className="text-black text-2xl font-semibold">Add Supplier</div>
          </div>
    
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 w-full">
            <div className="input-container">
                <label>ABN:</label>
                <input
                    placeholder="ABN"
                    value={abn}
                    onChange={(e) => setAbn(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Name:</label>
                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Contact Person:</label>
                <input
                    placeholder="Contact Person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Email:</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Phone:</label>
                <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Address:</label>
                <input
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Products Supplied:</label>
                <input
                    placeholder="Products Supplied (comma separated)"
                    value={productsSupplied.join(', ')}
                    onChange={(e) =>
                    setProductsSupplied(
                        e.target.value.split(',').map((item) => item.trim())
                    )
                    }
                    required
                />
            </div>
    
            <div className="input-container">
                <label>Notes:</label>
                <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
    
            <div className="flex justify-between gap-4 mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 p-2.5 rounded-2xl border border-amber-200"
                >
                    Cancel
                </button>
                <button type="submit" className="flex-1 p-2.5 bg-amber-200 rounded-2xl">
                    Done
                </button>
                </div>
            </form>
        </div>
      );
    };