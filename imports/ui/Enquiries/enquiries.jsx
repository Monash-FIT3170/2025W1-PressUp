import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './Enquiries.css';

export const Enquiries = () => {
    const [contact,setContact] = useState('');
    const [content,setContent] = useState('');
    const checkIsEmail = (string) => {
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(string);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (checkIsEmail(contact) && content != '') {
            console.log(contact);
            console.log(content);
            //Meteor.call("enquiry.insert",contact,content);
            setContact('');
            setContent('');
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="contact">Email</label>
                <input
                    id="contact"
                    type="email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter Email"
                    required
                />
                <label htmlFor="content">How can we help you?</label>
                <input
                    id="content"
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                />
            </form>
        </div>
    )
}