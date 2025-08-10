import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import { EnquiriesCollection } from "../../../api/enquiries/enquiries-collection";
import { LoadingIndicator } from "../OrderSummary/LoadingIndicator/LoadingIndicator.jsx";
import './EnquiryResponseCard.css';
import { EnquiryResponseCard } from './EnquiryResponseCard.jsx';

export const EnquiryResponsePage = (() => {
    const isLoading = useSubscribe("enquiries.active");
    const enquiries = useFind(()=>EnquiriesCollection.find({ active }),[true]);

    return (
        <div>
            {enquiries.map((enquiry)=>(
                <EnquiryResponseCard 
                    enquiryID={enquiry._id}
                />
            ))}
        </div>
    )
})