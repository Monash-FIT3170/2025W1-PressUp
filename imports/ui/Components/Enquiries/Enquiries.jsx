import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './Enquiries.css';
import { CustomerNavbar } from '../PreLogin/CustomerNavbar.jsx';
import { useNavigate } from 'react-router-dom';

export const Enquiries = () => {
    const [contact,setContact] = useState("");
    const [content,setContent] = useState("");
    const [name,setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/');
      };

    const checkIsEmail = (string) => {
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(string);
    }
    const handleSubmit = (e) => {
        setIsLoading(true);
        e.preventDefault();
        if (checkIsEmail(contact) && content != '') {
            Meteor.call("enquiry.insert",contact,content,name,(err) => {
                setIsLoading(false)
            });
            setContact('');
            setContent('');
            navigate('/');
        }
    }

    return (
        <div className='pre-login-container'>
        <CustomerNavbar />
        
        <div className="enquiries-container">
            <div className='support-card'>
                <div className='enquiries-header'>
                <button onClick={handleGoBack} className="back-btn">
                ← Back to Home
                </button>
                    <h1>Customer Support</h1>
                    <p>Provide us with an email address to contact and one of our team members will respond as soon as possible!</p>
                </div>
                <form onSubmit={handleSubmit} className="enquiries-form">
                    <div className="enquiries-input-group">
                        <label htmlFor="contact">Email Address *</label>
                        <input
                            id="contact"
                            type="email"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="example@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="enquiries-input-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Full Name"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="enquiries-input-group">
                        <label htmlFor="content">How can we help you? *</label>
                        <textarea
                            id="content"
                            type="text"
                            value={content}
                            placeholder='your support question'
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
        </div>
        </div>
    )
}