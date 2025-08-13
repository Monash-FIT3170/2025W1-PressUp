import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import { FeedbackCollection } from '../../../api/feedback/feedback-collection.js';
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import './FeedbackResponseCard.css';


export const FeedbackResponseCard = ({
    feedbackID
}) => {
    const isLoading = useSubscribe("feedback.id", feedbackID);
    var feedback = useFind(()=>FeedbackCollection.find({_id: feedbackID}),[feedbackID]);
    feedback = feedback[0];
    const [important,setImportant] = useState(feedback.important)
    

    if (isLoading()) {
        return <LoadingIndicator />;
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
        <> <b>{feedback.name ? feedback.name : "Anonymous"} rated us: </b> {feedback.rating}/10 <div>{feedback.content && <p>further details: <br /> <em> {feedback.content}</em></p> }</div></>
            <label htmlFor='imp'>priority</label>
            <input
                id = 'imp'
                type = 'checkbox'
                checked = {important}
                onChange={handlePrioritise}
            />
            <button 
                    type="submit"
                >resolved</button>
        </div>
    )
}

