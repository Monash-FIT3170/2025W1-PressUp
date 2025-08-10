import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './Enquiries.css';

export const Enquiries = () => {
    const [contact,setContact] = useState('');
    const [content,setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const checkIsEmail = (string) => {
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(string);
    }
    const handleSubmit = (e) => {
        setIsLoading(true);
        e.preventDefault();
        if (checkIsEmail(contact) && content != '') {
            Meteor.call("enquiry.insert",contact,content,(err) => {
                setIsLoading(false)
            });
            setContact('');
            setContent('');
        }
    }

    return (
        <div className="enquiries-container">
            <form onSubmit={handleSubmit} className="enquiries-form">
                <div className="enquiries-input-group">
                    <label htmlFor="contact">Email</label>
                    <input
                        id="contact"
                        type="email"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Enter Email"
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="enquiries-input-group">
                    <label htmlFor="content">How can we help you?</label>
                    <textarea
                        id="content"
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className='enquiries-text-box'
                        disabled={isLoading}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                >{isLoading ? 'Submitting' : 'Submit'}</button>
            </form>
        </div>
    )
}