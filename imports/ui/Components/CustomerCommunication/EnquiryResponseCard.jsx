import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import { EnquiriesCollection } from "../../../api/enquiries/enquiries-collection";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import './EnquiryResponseCard.css';


export const EnquiryResponseCard = ({
    enquiryID
}) => {
    const isLoading = useSubscribe("enquiries.id", enquiryID);
    var enquiry = useFind(()=>EnquiriesCollection.find({_id: enquiryID}),[enquiryID]);]
    enquiry = enquiry[0];
    
    const [response,setResponse] = useState(enquiry.response)

    if (isLoading()) {
        return <LoadingIndicator />;
    }

    const handleSave = (e) => {
        e.preventDefault();
        Meteor.call("enquiry.draft",enquiryID,response);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        Meteor.call("enquiry.respond",enquiryID,response);
    }

    return (
        <div>{enquiry.content}</div>
    )
}