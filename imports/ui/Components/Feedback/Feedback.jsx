import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './Feedback.css';
import { CustomerNavbar } from '../PreLogin/CustomerNavbar.jsx';
import { useNavigate } from 'react-router-dom';

export const Feedback = () => {
    const [orderID,setOrderID] = useState("");
    const [content,setContent] = useState("");
    const [name,setName] = useState("");
    const [rating,setRating] = useState(5);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/');
      };
    const handleSubmit = (e) => {
        setIsLoading(true);
        e.preventDefault();
        Meteor.call("feedback.insert",orderID,rating,content,name,(err) => {
            setIsLoading(false);
            navigate('/');
        });
        
        
    }

    return (
        <div className='pre-login-container'>
        <CustomerNavbar />
        
        <div className="feedback-container">
            <div className='support-card'>
                <div className='feedback-header'>
                <button onClick={handleGoBack} className="back-btn">
                ← Back to Home
                </button>
                    <h1>Customer Feedback</h1>
                    <p>We appreciate all Feedback!<br/><em>simply provide the order ID from your reciept and rate your experience</em></p>
                    
                </div>
                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="feedback-input-group">
                        <label htmlFor="orderID">Order ID*</label>
                        <div className='feedback-order-id'>#
                        <input
                            id="orderID"
                            type="text"
                            value={orderID}
                            onChange={(e) => setOrderID(e.target.value)}
                            placeholder="uRc45CBRPiMRMN46w"
                            required
                            className='feedback-order-input'
                            disabled={isLoading}
                        /></div>
                    </div>
                    <div className="feedback-input-group">
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
                    <div className="feedback-input-group">
                        <label htmlFor='rating'>Give us a rating: {rating}/10</label>
                        <input 
                        id = "rating" 
                        type="range" 
                        min={0}
                        max={10} 
                        value={rating}
                        onChange={(e)=>setRating(e.target.value)}
                        />
                        <label htmlFor="content">Any further details?</label>
                        <textarea
                            id="content"
                            type="text"
                            value={content}
                            placeholder='The coffee could have been coffee-er'
                            onChange={(e) => setContent(e.target.value)}
                            className='feedback-text-box'
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