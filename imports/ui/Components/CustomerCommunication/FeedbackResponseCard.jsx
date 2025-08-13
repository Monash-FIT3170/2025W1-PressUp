import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import { FeedbackCollection } from '../../../api/feedback/feedback-collection.js';
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import './FeedbackResponseCard.css';


export const FeedbackResponseCard = ({
    feedbackID
}) => {
    if (!feedbackID) {
        return <></>
    }
    const isLoading = useSubscribe("feedback.id", feedbackID);
    var feedback = useFind(()=>FeedbackCollection.find({_id: feedbackID}),[feedbackID]);
    if (feedback.length > 0) {
        feedback = feedback[0];
    } else {
        feedback = {'important':false,'resolved':true};
    }
    
    const [important,setImportant] = useState(feedback.important || false);

    
    

    if (isLoading()) {
        return <LoadingIndicator />;
    }

    if (feedback.resolved) {
        return <></>
    } 
    
    const handlePrioritise = (e)=>{
        e.preventDefault();
        Meteor.call('feedback.priority',feedbackID,!important,(err,priority) => {
            setImportant(priority)
        })
    }

    const handleResolve = (e) => {
        e.preventDefault();
        Meteor.call("feedback.resolve",feedbackID);
    }

    if (feedback.resolved) {
        return (<></>)
    }
    return (
        <div className='feedback-container'>
            <div className='feedback-section'> 
            <> <b>{feedback.name ? feedback.name : "Anonymous"} rated us: </b> {feedback.rating}/10 <div>{feedback.content && <p>further details: <br /> <em> {feedback.content}</em></p> }</div></>
            </div>
            <div className='button-section'>
        <div className='priority'>
        <label htmlFor='imp' className='priority-label'>priority</label>
            <input
                id = 'imp'
                type = 'checkbox'
                checked = {important}
                onChange={handlePrioritise}
                className='priority-check'
            />
            </div>
            <button 
                    type="submit"
                    onClick={handleResolve}
                    className = 'resolve-button'
                >resolved</button>
            </div>
        </div>
    )
}

