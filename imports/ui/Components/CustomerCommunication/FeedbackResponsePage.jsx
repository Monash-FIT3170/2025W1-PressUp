import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind, useTracker } from "meteor/react-meteor-data";
import { FeedbackCollection } from '../../../api/feedback/feedback-collection.js';
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import './FeedbackResponsePage.css'
import { FeedbackResponseCard } from './FeedbackResponseCard.jsx';

export const FeedbackResponsePage = (() => {
    const isLoading = useSubscribe("feedback.unresolved");
    const feedback = useTracker(()=> FeedbackCollection.find({}).fetch());
    feedback.sort((a,b) => {
        if (a.important && !b.important) {
            return -1;
        } else if (!a.important && b.important) {
            return 1;
        } else {
            return b.date - a.date
        }
    })
    if (isLoading()) {
        return <LoadingIndicator />;
    }

    const existsActive = () => {
        var exists = false;
        const indexToRemove = [];
        for (i = 0;i < feedback.length;i++) {
            if (!feedback) {
                indexToRemove.push(i)
            } else if (!feedback[i].resolved) {
                exists = true;
            } else {
                indexToRemove.push(i)
            }
        }
        indexToRemove.forEach((element) => {
            feedback.splice(element,1);
        })
        if (feedback.length < 1) {
            return false
        }
        return exists;
    }
    if (!existsActive()) {
        
        return (<><div className='container'>
            <h1>Customer Feedback:</h1>
            <div className='feedback'><b><em> No unresolved customer feedback!</em></b></div>
            
        </div></>)
    }
    return (
        <>
        <div className='container'>
        <h1>Customer Feedback:</h1>
        <div className='feedback'>
            {feedback.map((feedback)=>(
                <div key = {feedback._id}>
                <FeedbackResponseCard 
                    feedbackID={feedback._id}
                    key = {feedback._id}
                />
                </div>
            ))}
            </div>
        </div>
        </>
    )
})