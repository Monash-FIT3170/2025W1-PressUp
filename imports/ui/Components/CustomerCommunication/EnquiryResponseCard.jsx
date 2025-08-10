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
    var enquiry = useFind(()=>EnquiriesCollection.find({_id: enquiryID}),[enquiryID]);
    enquiry = enquiry[0];
    
    const [response,setResponse] = useState(enquiry.response);
    const [inFocus,setInFocus] = useState(false);

    if (isLoading()) {
        return <LoadingIndicator />;
    }

    const handleFocus = (e) => {
        console.log("hello")
        e.preventDefault();
        setInFocus(!inFocus);
    }

    const handleSave = (e) => {
        e.preventDefault();
        Meteor.call("enquiry.draft",enquiryID,response);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        Meteor.call("enquiry.respond",enquiryID,response);
    }

    if (!enquiry.active) {
        return (<></>)
    }


    if (inFocus) {
        return (
            <div>
            <div> {enquiry.name ? enquiry.name : "Anonymous"} asked: <p>{enquiry.content} </p></div>
            <form onSubmit={handleSubmit}>
                <div className="enquiries-input-group">
                        <label htmlFor="response">Response</label>
                        <textarea
                            id="response"
                            type="text"
                            value={response}
                            placeholder='the response'
                            onChange={(e) => setResponse(e.target.value)}
                            required
                        />
                </div>
                <button 
                        type="submit"
                    >answer</button>
            </form> 
            </div>
        )
    }
    return (
        <div>
        <button onClick={handleFocus}> {enquiry.name ? enquiry.name : "Anonymous"} asked: <p>{enquiry.content}</p></button>       
        </div>
    )
}