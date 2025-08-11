import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind, useTracker } from "meteor/react-meteor-data";
import { EnquiriesCollection } from "../../../api/enquiries/enquiries-collection";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import './EnquiryResponsePage.css';
import { EnquiryResponseCard } from './EnquiryResponseCard.jsx';

export const EnquiryResponsePage = (() => {
    const isLoading = useSubscribe("enquiries.active");
    const enquiries = useTracker(()=> EnquiriesCollection.find({}).fetch());
    
    if (isLoading()) {
        return <LoadingIndicator />;
    }

    const existsActive = () => {
        var exists = false;
        for (i = 0;i < enquiries.length;i++) {
            if (enquiries[i].active) {
                exists = true;
            }
        }
        return exists;
    }
    if (!existsActive()) {
        
        return (<><div className='container'>
            <h1>Customer Support Questions:</h1>
            <div className='questions'><b><em>All Customer Questions Answered!</em></b></div>
            
        </div></>)
    }
    return (
        <>
        <div className='container'>
        <h1>Customer Support Questions:</h1>
        <div className='questions'>
            {enquiries.map((enquiry)=>(
                <div key = {enquiry._id}>
                <EnquiryResponseCard 
                    enquiryID={enquiry._id}
                    key = {enquiry._id}
                />
                </div>
            ))}
            </div>
        </div>
        </>
    )
})