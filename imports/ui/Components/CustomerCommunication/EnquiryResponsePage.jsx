import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind, useTracker } from "meteor/react-meteor-data";
import { EnquiriesCollection } from "../../../api/enquiries/enquiries-collection";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import './EnquiryResponseCard.css';
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

    if (enquiries.length == 0 || !existsActive) {
        return (<div>
            All Customer Questions Answered!
        </div>)
    }
    return (
        <div>
            {enquiries.map((enquiry)=>(
                <EnquiryResponseCard 
                    enquiryID={enquiry._id}
                    key = {enquiry._id}
                />
            ))}
        </div>
    )
})